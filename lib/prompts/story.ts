import type { StoryLevel } from '@/lib/types';

const STORY_SYSTEM_PROMPT = `You are a content generator for LearnFlow.
Produce original B1–B2 English stories (~12–15 minutes reading),
with a 3–4 line Hebrew TL;DR. Avoid copyrighted plots, quotes, or book titles.
Return STRICT JSON only that matches the given schema keys. No explanations.
Before returning, internally self-check: (1) B1–B2 readability, (2) safety & age-appropriateness,
(3) originality (no known titles/characters), (4) length targets. If any check fails, fix and only then return JSON.`;

export function storySystem() {
  return STORY_SYSTEM_PROMPT;
}

type StoryPromptInput = {
  topic: string;
  level: StoryLevel;
  minutes: number;
  genre?: string;
};

export function storyUser({ topic, level, minutes, genre }: StoryPromptInput) {
  const desiredGenre = genre?.trim() || 'general fiction';
  return `Goal: Create one story about: "${topic}"
Constraints:
- English body length target: 1800–2200 words, level ${level} (B1/B2)
- Structure: 4–6 sections with short headings
- Include: 5 MCQ comprehension questions; vocabulary list (<=15 items) with Hebrew translations
- Include: Hebrew TL;DR of 3–4 short lines
- Genre: ${desiredGenre}
- Reading minutes: ${minutes}
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
Return strictly JSON without markdown code fences.`;
}

export function storyOutlineUser(input: StoryPromptInput) {
  const desiredGenre = input.genre?.trim() || 'general fiction';
  return `Goal: Create a clean outline for a story about "${input.topic}" at ${input.level} level.
Constraints:
- Outline only: include {title_en, hook, sections:[{heading, bullet_outline}]}
- Genre: ${desiredGenre}
- Reading minutes target: ${input.minutes}
- Sections: 4–6 max with logical beats
- Keep TL;DR, vocab, and quiz for later phases
Return STRICT JSON with keys { "title_en": string, "hook": string, "sections": [{"heading": string, "bullet_outline": string}] }`;
}

export function storySectionUser({
  heading,
  bulletOutline,
  outline,
  level
}: {
  heading: string;
  bulletOutline: string;
  outline: string;
  level: StoryLevel;
}) {
  return `Heading: ${heading}
Target level: ${level}
Outline context:
${outline}

Rewrite the outline above into a polished narrative section (250–400 words) in English at ${level} level.
Keep coherence with the outline and return only the paragraph text.`;
}
