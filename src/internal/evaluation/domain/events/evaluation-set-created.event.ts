import { EvaluationType } from '@prisma/client';

export interface IEvaluationSetCreatedEvent {
  evaluationSetId: string;
  editorId: string;
  languagePairId: string;
  type: EvaluationType;
}

export class EvaluationSetCreatedEvent {
  constructor(public readonly payload: IEvaluationSetCreatedEvent) {}
}
