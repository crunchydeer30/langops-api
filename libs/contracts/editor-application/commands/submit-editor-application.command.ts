import { z } from 'zod';
import { EDITOR_APPLICATION_HTTP_ROUTES } from '../controllers';

export namespace SubmitEditorApplicationCommand {
  export const ENDPOINT = EDITOR_APPLICATION_HTTP_ROUTES.SUBMIT;
  export const METHOD = 'POST';

  export const BodySchema = z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email().max(100),
    languagePairIds: z.array(z.string().uuid()).min(1),
  });
  export type BodySchema = z.infer<typeof BodySchema>;

  export const ResponseSchema = z.object({
    applicationId: z.string(),
    message: z.string(),
  });
  export type ResponseSchema = z.infer<typeof ResponseSchema>;
}
