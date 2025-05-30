import { z } from 'zod';

export const TranslationTaskPickResponseSchema = z.object({
  translationTaskId: z.string().uuid(),
  languagePairId: z.string().uuid(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  isEvaluationTask: z.boolean(),
  wordCount: z.number().int().positive(),
  segments: z.array(
    z.object({
      segmentId: z.string().uuid(),
      segmentOrder: z.number().int().positive(),
      segmentType: z.string(),
      anonymizedContent: z.string().nullable(),
      machineTranslatedContent: z.string().nullable(),
    }),
  ),
});

export type TranslationTaskPickResponse = z.infer<
  typeof TranslationTaskPickResponseSchema
>;
