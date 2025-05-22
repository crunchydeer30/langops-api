import { FormatMetadata } from 'src/internal/translation-task-processing/domain/interfaces';

export interface TranslationSegment {
  id: string;
  content: string;
  formatMetadata?: FormatMetadata;
}

export interface BaseTranslateCommandParams {
  sourceLanguage: string;
  targetLanguage: string;
  segments: TranslationSegment[];
}

export interface TranslationResult {
  segmentId: string;
  translatedText: string;
}

export abstract class BaseTranslateCommand {
  constructor(public readonly params: BaseTranslateCommandParams) {}
}

export interface IBaseTranslationResult {
  results: TranslationResult[];
}
