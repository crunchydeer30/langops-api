import { TRANSLATION_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace CreateTranslationCommand {
  export const ENDPOINT = TRANSLATION_HTTP_ROUTES.CREATE;
  export const METHOD = 'POST';

  export const RequestSchema = z.object({
    source_language: z.string().min(2).max(10),
    target_language: z.string().min(2).max(10),
    text: z.string(),
    text_format: z.enum(['text', 'html', 'xliff', 'csv', 'srt', 'email']),
    callback_url: z.string().url().optional(),
    order_number: z.number().optional(),
  });
  export type Request = z.infer<typeof RequestSchema>;

  export const ResponseSchema = z.object({
    uid: z.string(),
    order_number: z.number(),
    price: z.number().default(0),
    source_language: z.string(),
    target_language: z.string(),
    text: z.string(),
    text_format: z.string(),
    status: z.string(),
  });
  export type Response = z.infer<typeof ResponseSchema>;
}
