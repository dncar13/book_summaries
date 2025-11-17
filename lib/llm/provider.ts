export type ModelProvider = {
  name: string;
  maxConcurrent: number;
  callJSON: (args: { system: string; user: string; schemaName: string }) => Promise<string>;
};
