export interface IRateEvaluationTaskCommandPayload {
  evaluationSetId: string;
  taskId: string;
  rating: number;
  feedback: string;
  evaluatorId: string;
}

export class RateEvaluationTaskCommand {
  constructor(public readonly payload: IRateEvaluationTaskCommandPayload) {}
}

export interface IRateEvaluationTaskCommandResponse {
  id: string;
  rating: number;
  seniorEditorFeedback: string | null;
  taskId: string;
  evaluationSetId: string;
  success: boolean;
}
