export interface IEvaluationSetCompletedEvent {
  evaluationSetId: string;
  editorId: string;
  languagePairId: string;
  averageRating: number;
  isQualified: boolean;
}

export class EvaluationSetCompletedEvent {
  constructor(public readonly payload: IEvaluationSetCompletedEvent) {}
}
