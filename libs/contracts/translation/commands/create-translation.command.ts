import { TRANSLATION_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';
import { TranslationSchema } from '../models/translation.schema';
import { TranslationFormat } from '../enums';

export namespace CreateTranslationCommand {
  export const ENDPOINT = TRANSLATION_HTTP_ROUTES.CREATE;
  export const METHOD = 'POST';

  export const RequestSchema = z.object({
    source_language: z.string().min(2).max(3),
    target_language: z.string().min(2).max(3),
    text: z.string(),
    text_format: z.nativeEnum(TranslationFormat),
    callback_url: z.string().url().optional(),
  });
  export type Request = z.infer<typeof RequestSchema>;

  export const ResponseSchema = TranslationSchema;
  export type Response = z.infer<typeof ResponseSchema>;
}
