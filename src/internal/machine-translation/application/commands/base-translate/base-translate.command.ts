export interface BaseTranslateCommandParams {
  taskId: string;
}
export interface IBaseTranslationResult {
  results: {
    segmentId: string;
    translatedText: string;
  }[];
}

export abstract class BaseTranslateCommand {
  constructor(public readonly params: BaseTranslateCommandParams) {}
}
