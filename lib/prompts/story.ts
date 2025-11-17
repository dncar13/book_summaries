export const storySystem = () => `
You are a content generator for LearnFlow.
Produce original B1–B2 English stories (~12–15 minutes reading),
with a 3–4 line Hebrew TL;DR. Avoid copyrighted plots, quotes, or book titles.
Return STRICT JSON only that matches the given schema keys. No explanations.
Before returning, internally self-check: (1) B1–B2 readability, (2) safety & age-appropriateness,
(3) originality (no known titles/characters), (4) length targets. If any check fails, fix and only then return JSON.
`.trim();

export const storyUser = (p: { topic: string; level?: 'B1'|'B2'; minutes?: number; genre?: string; }) => `
Goal: Create one story about: "${p.topic}"
Constraints:
- English body length target: 1800–2200 words, level ${p.level ?? 'B1'} (B1/B2)
- Structure: 4–6 sections with short headings
- Include: 5 MCQ comprehension questions; vocabulary list (<=15 items) with Hebrew translations
- Include: Hebrew TL;DR of 3–4 short lines
- Genre: ${p.genre ?? 'general fiction'}
- Reading minutes: ${p.minutes ?? 13}
- Topics tags: 1–5 tags
Output JSON object with these keys ONLY:
{
  "slug": string (url-safe),
  "title_en": string (<=70 chars),
  "level": "B1"|"B2",
  "reading_minutes": number (10–20),
  "genre": string,
  "hook": string (20–160 chars),
  "tldr_he": string (60–400 chars),
  "body_en": string (~1800–2200 words),
  "sections": [{"heading": string, "text": string}] (length 4–6),
  "vocab": [{"word": string, "pos": string, "he": string, "en"?: string}] (<=15),
  "quiz": [{"q": string, "a": [string,string,string,string], "correct": 0|1|2|3}] (length 5),
  "topics": [string, ... up to 5]
}
Return strictly JSON without markdown code fences.
`.trim();

export const outlineUser = (p: { topic: string; level?: 'B1'|'B2'; genre?: string }) => `
Create an outline for a B1–B2 English story about "${p.topic}" (genre: ${p.genre ?? 'general fiction'}).
Return JSON with:
{
  "title_en": string,
  "hook": string,
  "sections": [{"heading": string, "bullets": [string, string, ...]}] (length 4–6)
}
`.trim();

export const sectionUser = (p: { heading: string; bullets: string[]; level?: 'B1'|'B2' }) => `
Write one section titled "${p.heading}" for a ${p.level ?? 'B1'} story.
Follow these bullets strictly: ${p.bullets.join(' • ')}.
Return JSON:
{ "heading": "${p.heading}", "text": string (>=300 words) }
Return ONLY JSON.
`.trim();

export const rewriterSystem = () => `
You are a language level controller. Given an English story,
rewrite it to match B1–B2 constraints without changing the plot.
Keep sentences short-to-medium, reduce rare idioms, keep coherence and section boundaries.
Return ONLY the rewritten story text.
`.trim();

export const rewriterUser = (p: { level: 'B1'|'B2'; body_en: string }) => `
Target level: ${p.level}
Constraints: ~1800–2200 words, keep headings as provided.
Rewrite this story accordingly:
<<<
${p.body_en}
>>>
`.trim();
