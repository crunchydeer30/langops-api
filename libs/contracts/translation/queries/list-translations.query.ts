import { TRANSLATION_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace ListTranslationsQuery {
  export const ENDPOINT = TRANSLATION_HTTP_ROUTES.LIST;
  export const METHOD = 'GET';

  export const QueryParamsSchema = z.object({
    limit: z.coerce.number().int().positive().default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
    status: z.string().optional(),
  });
  export type QueryParams = z.infer<typeof QueryParamsSchema>;

  export const ResponseSchema = z.object({
    meta: z.object({
      limit: z.number(),
      offset: z.number(),
      total_count: z.number(),
      next: z.string().nullable(),
      previous: z.string().nullable(),
    }),
    objects: z.array(
      z.object({
        uid: z.string(),
        order_number: z.number(),
        price: z.number().default(0),
        source_language: z.string(),
        target_language: z.string(),
        text_format: z.string(),
        status: z.string(),
      }),
    ),
  });
  export type Response = z.infer<typeof ResponseSchema>;
}
