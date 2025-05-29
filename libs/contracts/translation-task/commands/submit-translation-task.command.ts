import { z } from 'zod';
import { TRANSLATION_TASK_HTTP_ROUTES } from '../controllers/translation-task.http.routes';

export namespace SubmitTranslationTaskCommand {
  export const ENDPOINT = TRANSLATION_TASK_HTTP_ROUTES.SUBMIT;
  export const METHOD = 'POST';

  export const RequestSchema = z.object({
    segments: z.array(
      z.object({
        segmentId: z.string().uuid(),
        editedContent: z.string(),
      }),
    ),
  });
  export type Request = z.infer<typeof RequestSchema>;

  export const ResponseSchema = z.object({
    success: z.boolean(),
    translationTaskId: z.string().uuid(),
  });
  export type Response = z.infer<typeof ResponseSchema>;
}
