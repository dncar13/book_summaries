export type ModelProvider = {
  name: string;
  maxConcurrent: number;
  callJSON: (args: {
    system: string;
    user: string;
    schemaName: string;
  }) => Promise<string>;
};

type SlotState = {
  inFlight: number;
  queue: Array<() => void>;
};

const slotMap = new Map<string, SlotState>();

async function acquireSlot(provider: ModelProvider) {
  if (provider.maxConcurrent <= 0) {
    return;
  }
  const limit = provider.maxConcurrent;
  const state = getSlotState(provider.name);
  if (state.inFlight < limit) {
    state.inFlight += 1;
    return;
  }

  await new Promise<void>((resolve) => {
    state.queue.push(resolve);
  });
  state.inFlight += 1;
}

function releaseSlot(provider: ModelProvider) {
  if (provider.maxConcurrent <= 0) {
    return;
  }
  const state = getSlotState(provider.name);
  state.inFlight = Math.max(0, state.inFlight - 1);
  const next = state.queue.shift();
  if (next) {
    next();
  }
}

function getSlotState(name: string): SlotState {
  let state = slotMap.get(name);
  if (!state) {
    state = { inFlight: 0, queue: [] };
    slotMap.set(name, state);
  }
  return state;
}

export async function withProviderLimit<T>(provider: ModelProvider, fn: () => Promise<T>) {
  await acquireSlot(provider);
  try {
    return await fn();
  } finally {
    releaseSlot(provider);
  }
}
