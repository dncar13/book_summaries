import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a #RRGGBB hex value');

export const StorySectionSchema = z.object({
  heading: z.string().min(3).max(120),
  text: z.string().min(200)
});

export const StoryVocabEntrySchema = z.object({
  word: z.string().min(1).max(60),
  pos: z.string().min(1).max(20),
  he: z.string().min(1).max(120),
  en: z.string().min(1).max(200).optional()
});

export const StoryQuizQuestionSchema = z.object({
  q: z.string().min(5).max(200),
  a: z.array(z.string().min(1).max(200)).length(4),
  correct: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
});

export const StoryDoc = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'slug must be url-safe'),
    title_en: z.string().min(3).max(70),
    level: z.union([z.literal('B1'), z.literal('B2')]),
    reading_minutes: z.number().min(10).max(20),
    genre: z.string().min(3).max(60),
    hook: z.string().min(20).max(160),
    tldr_he: z.string().min(60).max(400),
    body_en: z.string().min(1000),
    sections: z.array(StorySectionSchema).min(4).max(6),
    vocab: z.array(StoryVocabEntrySchema).max(15),
    quiz: z.array(StoryQuizQuestionSchema).length(5),
    topics: z.array(z.string().min(2).max(40)).min(1).max(5)
  })
  .describe('StoryDoc');

export const CoverSpec = z
  .object({
    seed: z.number().int(),
    palette: z.object({
      bg: hexColor,
      fg: hexColor,
      accent: hexColor
    }),
    motif: z.enum(['abstract', 'city', 'forest', 'ocean', 'mountains']),
    shapes: z
      .array(
        z.object({
          type: z.enum(['circle', 'rect', 'wave', 'arc']),
          count: z.number().int().min(3).max(40),
          sizeRange: z
            .tuple([z.number().positive(), z.number().positive()])
            .refine(([min, max]) => max >= min, {
              message: 'sizeRange max must be >= min'
            }),
          noise: z.number().min(0).max(1)
        })
      )
      .min(1)
      .max(3),
    typography: z.object({
      titleCase: z.enum(['uppercase', 'title', 'sentence']),
      weight: z.number().int().min(300).max(900),
      letterSpacing: z.number().min(-1).max(1)
    })
  })
  .describe('CoverSpec');

export type StorySectionData = z.infer<typeof StorySectionSchema>;
export type StoryVocabEntryData = z.infer<typeof StoryVocabEntrySchema>;
export type StoryQuizQuestionData = z.infer<typeof StoryQuizQuestionSchema>;
export type StoryDocData = z.infer<typeof StoryDoc>;
export type CoverSpecData = z.infer<typeof CoverSpec>;
