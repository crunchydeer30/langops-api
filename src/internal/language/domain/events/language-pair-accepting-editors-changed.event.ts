export interface ILanguagePairAcceptingEditorsChangedEvent {
  languagePairId: string;
  isAcceptingEditors: boolean;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}

export class LanguagePairAcceptingEditorsChangedEvent {
  constructor(
    public readonly payload: ILanguagePairAcceptingEditorsChangedEvent,
  ) {}
}
