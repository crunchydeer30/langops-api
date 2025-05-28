export class EvaluationTaskSubmittedEvent {
  constructor(
    public readonly payload: {
      taskId: string;
      evaluationSetId: string;
      editedContent: string;
    },
  ) {}
}
