import { EDITOR_APPLICATION_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace ApproveEditorApplicationCommand {
  export const ENDPOINT = EDITOR_APPLICATION_HTTP_ROUTES.APPROVE;
  export const METHOD = 'POST';

  export const ParamsSchema = z.object({
    id: z.string().uuid(),
  });
  export type ParamsSchema = z.infer<typeof ParamsSchema>;

  export const ResponseSchema = z.object({
    success: z.boolean(),
    applicationId: z.string().uuid(),
  });
  export type ResponseSchema = z.infer<typeof ResponseSchema>;
}
