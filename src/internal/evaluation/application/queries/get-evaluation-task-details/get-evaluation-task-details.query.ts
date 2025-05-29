import { IQuery } from '@nestjs/cqrs';

export interface IGetEvaluationTaskDetailsQueryProps {
  evaluationSetId: string;
  taskId: string;
  reviewerId: string;
}

export class GetEvaluationTaskDetailsQuery implements IQuery {
  constructor(public readonly props: IGetEvaluationTaskDetailsQueryProps) {}
}

export interface IEvaluationTaskSegment {
  id: string;
  sourceText: string;
  machineTranslatedText: string;
  editedContent: string | null;
  order: number;
}

export interface IEvaluationTaskDetails {
  id: string;
  rating: number | null;
  feedback: string | null;
  submissionDate: Date | null;
  segments: IEvaluationTaskSegment[];
}

export type IGetEvaluationTaskDetailsQueryResponse = IEvaluationTaskDetails;
