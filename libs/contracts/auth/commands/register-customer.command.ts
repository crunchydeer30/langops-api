import { AUTH_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace RegisterCustomerCommand {
  export const ENDPOINT = AUTH_HTTP_ROUTES.CUSTOMER.REGISTER;
  export const METHOD = 'POST';

  export const BodySchema = z.object({
    email: z.string().email().max(100),
    password: z.string().min(8).max(100),
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
  });
  export type BodySchema = z.infer<typeof BodySchema>;

  export const ResponseSchema = z.object({
    userId: z.string().uuid(),
    accessToken: z.string(),
  });
  export type ResponseSchema = z.infer<typeof ResponseSchema>;
}
