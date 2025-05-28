import { EvaluationSetStatus } from '@prisma/client';

export interface IEvaluationSetStatusChangedEvent {
  evaluationSetId: string;
  status: EvaluationSetStatus;
}

export class EvaluationSetStatusChangedEvent {
  constructor(public readonly payload: IEvaluationSetStatusChangedEvent) {}
}
