import { ICommand } from '@nestjs/cqrs';

export interface IStartReviewCommandProps {
  evaluationSetId: string;
  reviewerId: string;
}

export class StartReviewCommand implements ICommand {
  constructor(public readonly props: IStartReviewCommandProps) {}
}
