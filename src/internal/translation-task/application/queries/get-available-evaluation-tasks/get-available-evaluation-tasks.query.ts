import { IQuery } from '@nestjs/cqrs';

export interface IGetAvailableEvaluationTasksQueryProps {
  editorId: string;
  languagePairId: string;
}

export interface IGetAvailableEvaluationTasksQueryResponse {
  languagePairId: string;
  sourceLanguage: string;
  targetLanguage: string;
  availableCount: number;
}

export class GetAvailableEvaluationTasksQuery implements IQuery {
  constructor(public readonly props: IGetAvailableEvaluationTasksQueryProps) {}
}
