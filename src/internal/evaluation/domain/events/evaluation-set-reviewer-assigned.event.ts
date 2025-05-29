export class EvaluationSetReviewerAssignedEvent {
  constructor(
    public readonly payload: {
      evaluationSetId: string;
      reviewerId: string;
    },
  ) {}
}
