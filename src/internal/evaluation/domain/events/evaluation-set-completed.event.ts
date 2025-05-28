export interface IEvaluationSetCompletedEvent {
  evaluationSetId: string;
  averageRating: number;
}

export class EvaluationSetCompletedEvent {
  constructor(public readonly payload: IEvaluationSetCompletedEvent) {}
}
