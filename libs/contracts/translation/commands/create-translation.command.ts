import { TRANSLATION_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';
import { TranslationFormat, TranslationStatus } from '../enums';

export namespace CreateTranslationCommand {
  export const ENDPOINT = TRANSLATION_HTTP_ROUTES.CREATE;
  export const METHOD = 'POST';

  export const RequestSchema = z.object({
    sourceLanguage: z.string(),
    targetLanguage: z.string(),
    text: z.string(),
    format: z.nativeEnum(TranslationFormat),
  });

  export type Request = z.infer<typeof RequestSchema>;

  export const ResponseSchema = z.object({
    id: z.string().uuid(),
    price: z.number().default(0),
    sourceLanguage: z.string(),
    targetLanguage: z.string(),
    text: z.string(),
    format: z.string(),
    status: z.nativeEnum(TranslationStatus),
  });
  export type Response = z.infer<typeof ResponseSchema>;
}
