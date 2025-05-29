import { z } from 'zod';
import { TRANSLATION_TASK_HTTP_ROUTES } from '../controllers/translation-task.http.routes';

export namespace GetAvailableEvaluationTasksQuery {
  export const ENDPOINT = `${TRANSLATION_TASK_HTTP_ROUTES.AVAILABLE_EVALUATIONS}/:languagePairId`;
  export const METHOD = 'GET';

  export const ParamsSchema = z.object({
    languagePairId: z.string().uuid(),
  });
  export type Params = z.infer<typeof ParamsSchema>;

  export const ResponseSchema = z.object({
    languagePairId: z.string().uuid(),
    sourceLanguage: z.string(),
    targetLanguage: z.string(),
    availableCount: z.number().int().nonnegative(),
  });

  export type Response = z.infer<typeof ResponseSchema>;
}
