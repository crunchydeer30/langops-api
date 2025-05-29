import { z } from 'zod';
import { TRANSLATION_TASK_HTTP_ROUTES } from '../controllers/translation-task.http.routes';

export namespace PickEvaluationTaskCommand {
  export const ENDPOINT = TRANSLATION_TASK_HTTP_ROUTES.PICK_EVALUATION;
  export const METHOD = 'POST';

  export const RequestSchema = z.object({
    languagePairId: z.string().uuid(),
  });
  export type Request = z.infer<typeof RequestSchema>;

  export const ResponseSchema = z.object({
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

  export type Response = z.infer<typeof ResponseSchema>;
}
