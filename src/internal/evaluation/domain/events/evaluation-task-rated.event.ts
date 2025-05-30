export interface IEvaluationTaskRatedEvent {
  evaluationTaskId: string;
  evaluationSetId: string;
  rating: number;
  seniorEditorFeedback: string | null;
}

export class EvaluationTaskRatedEvent {
  constructor(public readonly payload: IEvaluationTaskRatedEvent) {}
}
