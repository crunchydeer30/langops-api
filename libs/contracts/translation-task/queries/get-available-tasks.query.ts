import { z } from 'zod';
import { TRANSLATION_TASK_HTTP_ROUTES } from '../controllers/translation-task.http.routes';

export namespace GetAvailableTasksQuery {
  export const ENDPOINT = TRANSLATION_TASK_HTTP_ROUTES.AVAILABLE;
  export const METHOD = 'GET';

  export const ResponseSchema = z.array(
    z.object({
      languagePairId: z.string().uuid(),
      sourceLanguage: z.string(),
      targetLanguage: z.string(),
      availableCount: z.number().int().nonnegative(),
    }),
  );

  export type Response = z.infer<typeof ResponseSchema>;
}
