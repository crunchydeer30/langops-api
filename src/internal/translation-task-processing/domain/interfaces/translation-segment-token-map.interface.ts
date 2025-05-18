export enum TranslationSpecialTokenType {
  URL = 'URL',
  PHONE_NUMBER = 'PHONE_NUMBER',
  INLINE_FORMATTING = 'INLINE_FORMATTING',
  IMAGE = 'IMAGE',
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
  href?: string;
  displayText?: string;
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

export interface ImageSpecialToken extends BaseTranslationSpecialToken {
  type: TranslationSpecialTokenType.IMAGE;
  attrs: object;
  src?: string;
  alt?: string;
}

export type TranslationSpecialToken =
  | UrlSpecialToken
  | PhoneNumberSpecialToken
  | InlineFormattingSpecialToken
  | ImageSpecialToken;

export type TranslationSpecialTokenMap = Record<
  string,
  TranslationSpecialToken
>;
