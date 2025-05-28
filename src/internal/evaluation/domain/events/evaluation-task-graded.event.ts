export class EvaluationTaskGradedEvent {
  constructor(
    public readonly payload: {
      taskId: string;
      evaluationSetId: string;
      rating: number;
      feedback: string | null;
    },
  ) {}
}
