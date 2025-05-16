import { ORDER_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace CreateEmailTranslationOrderCommand {
  export const ENDPOINT = ORDER_HTTP_ROUTES.CREATE;
  export const METHOD = 'POST';

  export const BodySchema = z.object({
    languagePairId: z.string().uuid(),
    rawEmail: z.string().trim().min(1).max(100000),
  });
  export type BodySchema = z.infer<typeof BodySchema>;

  export const ResponseSchema = z.object({
    id: z.string().uuid(),
  });
  export type ResponseSchema = z.infer<typeof ResponseSchema>;
}
