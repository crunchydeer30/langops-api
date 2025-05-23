import { TRANSLATION_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';
import { TranslationSchema } from '../models';

export namespace GetTranslationByIdQuery {
  export const ENDPOINT = TRANSLATION_HTTP_ROUTES.GET_BY_ID;
  export const METHOD = 'GET';

  export const ParamsSchema = z.object({
    id: z.string().uuid(),
  });
  export type Params = z.infer<typeof ParamsSchema>;

  export const ResponseSchema = TranslationSchema;
  export type Response = z.infer<typeof ResponseSchema>;
}
