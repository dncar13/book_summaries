const COVER_SYSTEM_PROMPT = `You design programmatic, copyright-safe, text-only book covers as JSON specs
for an SVG renderer. Focus on abstract geometric compositions. No people, no logos.
Return STRICT JSON only.`;

export function coverSystem() {
  return COVER_SYSTEM_PROMPT;
}

type CoverPromptInput = {
  title_en: string;
  genre: string;
  hook: string;
};

export function coverUser({ title_en, genre, hook }: CoverPromptInput) {
  return `Create a cover spec for the story:
Title: "${title_en}"
Genre: "${genre}"
Mood: based on this hook: "${hook}"
Constraints:
- Palette: bg, fg, accent as hex
- Motif: one of ["abstract","city","forest","ocean","mountains"]
- Shapes: 1–3 entries with {type:["circle","rect","wave","arc"], count:3–40, sizeRange:[min,max], noise:0–1}
- Typography: {titleCase:["uppercase","title","sentence"], weight:300–900, letterSpacing:-1..1}
- Seed: integer
JSON keys ONLY:
{
  "seed": number,
  "palette": { "bg": "#RRGGBB", "fg": "#RRGGBB", "accent": "#RRGGBB" },
  "motif": "abstract"|"city"|"forest"|"ocean"|"mountains",
  "shapes": [{ "type": "circle"|"rect"|"wave"|"arc", "count": number, "sizeRange": [number,number], "noise": number }],
  "typography": { "titleCase": "uppercase"|"title"|"sentence", "weight": number, "letterSpacing": number }
}
Return strictly JSON without markdown code fences.`;
}
