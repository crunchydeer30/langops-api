export enum TranslationSpecialTokenType {
  URL = 'URL',
  PHONE_NUMBER = 'PHONE_NUMBER',
  INLINE_FORMATTING = 'INLINE_FORMATTING',
}

export interface BaseTranslationSpecialToken {
  id: string;
  sourceContent: string;
  type: TranslationSpecialTokenType;
}

export interface UrlSpecialToken extends BaseTranslationSpecialToken {
  type: TranslationSpecialTokenType.URL;
  attrs: object;
  innerHtml: string;
}

export interface PhoneNumberSpecialToken extends BaseTranslationSpecialToken {
  type: TranslationSpecialTokenType.PHONE_NUMBER;
}

export interface InlineFormattingSpecialToken
  extends BaseTranslationSpecialToken {
  type: TranslationSpecialTokenType.INLINE_FORMATTING;
  attrs: Record<string, string>;
  innerHtml: string;
}

export type TranslationSpecialToken =
  | UrlSpecialToken
  | PhoneNumberSpecialToken
  | InlineFormattingSpecialToken;

export type TranslationSpecialTokenMap = Record<
  string,
  TranslationSpecialToken
>;
