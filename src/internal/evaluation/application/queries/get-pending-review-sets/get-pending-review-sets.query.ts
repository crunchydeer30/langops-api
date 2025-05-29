import { IQuery } from '@nestjs/cqrs';

export interface IGetPendingReviewSetsQueryProps {
  editorId: string;
  languagePairId?: string;
}

export interface IGetPendingReviewSetsQueryResponse {
  id: string;
  languagePairId: string;
  createdAt: Date;
}

export class GetPendingReviewSetsQuery implements IQuery {
  constructor(public readonly props: IGetPendingReviewSetsQueryProps) {}
}
