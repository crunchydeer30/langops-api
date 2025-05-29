import { IQuery } from '@nestjs/cqrs';

export interface IGetEvaluationTasksQueryProps {
  evaluationSetId: string;
  reviewerId: string;
}

export class GetEvaluationTasksQuery implements IQuery {
  constructor(public readonly props: IGetEvaluationTasksQueryProps) {}
}

export interface IEvaluationTaskResponse {
  id: string;
  rating: number | null;
  feedback: string | null;
  submissionDate: Date | null;
}

export type IGetEvaluationTasksQueryResponse = IEvaluationTaskResponse[];
