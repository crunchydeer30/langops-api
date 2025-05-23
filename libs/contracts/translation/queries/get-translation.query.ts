import { TRANSLATION_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace GetTranslationQuery {
  export const ENDPOINT = TRANSLATION_HTTP_ROUTES.GET_BY_ID;
  export const METHOD = 'GET';

  export const ParamsSchema = z.object({
    uid: z.string().uuid(),
  });
  export type Params = z.infer<typeof ParamsSchema>;

  export const ResponseSchema = z.object({
    uid: z.string(),
    order_number: z.number(),
    price: z.number().default(0),
    source_language: z.string(),
    target_language: z.string(),
    text: z.string(),
    text_format: z.string(),
    status: z.string(),
    client: z.string(),
    balance: z.number().default(0),
  });
  export type Response = z.infer<typeof ResponseSchema>;
}
