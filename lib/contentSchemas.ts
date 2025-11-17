import { z } from 'zod';

export const Section = z.object({
  heading: z.string().min(3).max(80),
  text: z.string().min(200)
});

export const VocabItem = z.object({
  word: z.string().min(1),
  pos: z.string().min(1),
  he: z.string().min(1),
  en: z.string().optional()
});

export const QuizItem = z.object({
  q: z.string().min(5),
  a: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correct: z.number().int().min(0).max(3)
});

export const CoverSpec = z.object({
  seed: z.number().int(),
  palette: z.object({
    bg: z.string().regex(/^#([0-9a-fA-F]{6})$/),
    fg: z.string().regex(/^#([0-9a-fA-F]{6})$/),
    accent: z.string().regex(/^#([0-9a-fA-F]{6})$/)
  }),
  motif: z.enum(['abstract', 'city', 'forest', 'ocean', 'mountains']),
  shapes: z
    .array(
      z.object({
        type: z.enum(['circle', 'rect', 'wave', 'arc']),
        count: z.number().int().min(3).max(40),
        sizeRange: z.tuple([z.number(), z.number()]),
        noise: z.number().min(0).max(1)
      })
    )
    .min(1),
  typography: z.object({
    titleCase: z.enum(['uppercase', 'title', 'sentence']),
    weight: z.number().min(300).max(900),
    letterSpacing: z.number().min(-1).max(1)
  })
});

export const StoryDoc = z.object({
  slug: z.string().min(3).max(60),
  title_en: z.string().min(5).max(70),
  level: z.enum(['B1', 'B2']),
  reading_minutes: z.number().int().min(10).max(20),
  genre: z.string().min(3),
  hook: z.string().min(20).max(160),
  tldr_he: z.string().min(60).max(400),
  body_en: z.string().min(1500),
  sections: z.array(Section).min(4).max(6),
  vocab: z.array(VocabItem).max(15),
  quiz: z.array(QuizItem).length(5),
  topics: z.array(z.string()).min(1).max(5),
  cover_spec: CoverSpec.optional()
});

export type StoryDocT = z.infer<typeof StoryDoc>;
export type CoverSpecT = z.infer<typeof CoverSpec>;
