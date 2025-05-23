import { GetTranslationByIdHandler } from './get-translation-by-id';
import { ListTranslationsHandler } from './list-translations';

export * from './get-translation-by-id';
export * from './list-translations';

export const TranslationQueryHandlers = [
  GetTranslationByIdHandler,
  ListTranslationsHandler,
];
