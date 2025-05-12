import { AUTH_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace RegisterEditorCommand {
  export const ENDPOINT = AUTH_HTTP_ROUTES.EDITOR.REGISTER;
  export const METHOD = 'POST';

  export const BodySchema = z.object({
    token: z.string(),
    applicationId: z.string().uuid(),
    password: z.string().min(8),
  });
  export type BodySchema = z.infer<typeof BodySchema>;

  export const ResponseSchema = z.object({
    userId: z.string().uuid(),
    accessToken: z.string(),
  });
  export type ResponseSchema = z.infer<typeof ResponseSchema>;
}
