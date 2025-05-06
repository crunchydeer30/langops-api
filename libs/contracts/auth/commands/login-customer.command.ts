import { AUTH_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace LoginCustomerCommand {
  export const ENDPOINT = AUTH_HTTP_ROUTES.CUSTOMER.LOGIN;
  export const METHOD = 'POST';

  export const BodySchema = z.object({
    email: z.string().email().max(100),
    password: z.string().min(8).max(100),
  });
  export type BodySchema = z.infer<typeof BodySchema>;

  export const ResponseSchema = z.object({
    accessToken: z.string(),
  });
  export type ResponseSchema = z.infer<typeof ResponseSchema>;
}
