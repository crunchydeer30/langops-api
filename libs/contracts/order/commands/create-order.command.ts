import { ORDER_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace CreateOrderCommand {
  export const ENDPOINT = ORDER_HTTP_ROUTES.CREATE;
  export const METHOD = 'POST';

  export const BodySchema = z.object({
    languagePairId: z.string().uuid(),
    originalText: z
      .string()
      .trim()
      .min(1, { message: 'Original text cannot be empty' })
      .max(10000, {
        message: 'Original text exceeds maximum length of 10000 characters',
      }),
    taskSpecificInstructions: z
      .string()
      .optional()
      .transform((val) => val?.trim() || null),
  });
  export type BodySchema = z.infer<typeof BodySchema>;

  export const ResponseSchema = z.object({
    id: z.string().uuid(),
  });
  export type ResponseSchema = z.infer<typeof ResponseSchema>;
}
