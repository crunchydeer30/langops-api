import { TRANSLATION_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';
import { TranslationSchema } from '../models';

export namespace ListTranslationsQuery {
  export const ENDPOINT = TRANSLATION_HTTP_ROUTES.LIST;
  export const METHOD = 'GET';

  export const QueryParamsSchema = z.object({
    limit: z.coerce.number().int().positive().default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
    status: z.string().optional(),
  });
  export type QueryParams = z.infer<typeof QueryParamsSchema>;

  export const ResponseSchema = z.array(TranslationSchema);
  export type Response = z.infer<typeof ResponseSchema>;
}
