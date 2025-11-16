const REWRITER_SYSTEM_PROMPT = `You are a language level controller. Given an English story,
rewrite it to match B1–B2 constraints without changing the plot.
Keep sentences short-to-medium, reduce rare idioms, keep coherence and section boundaries.
Return ONLY the rewritten story text.`;

type RewriterInput = {
  level: 'B1' | 'B2';
  body_en: string;
};

export function rewriterSystem() {
  return REWRITER_SYSTEM_PROMPT;
}

export function rewriterUser({ level, body_en }: RewriterInput) {
  return `Target level: ${level}
Constraints: ~1800–2200 words, keep headings as provided.
Rewrite this story accordingly:
<<<
${body_en}
>>>`;
}
