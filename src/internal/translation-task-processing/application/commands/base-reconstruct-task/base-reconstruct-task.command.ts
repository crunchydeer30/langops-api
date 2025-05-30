import { ICommand } from '@nestjs/cqrs';

export class BaseReconstructTaskCommand implements ICommand {
  constructor(public readonly taskId: string) {}
}

export interface BaseReconstructTaskResponse {
  taskId: string;
  finalContent: string;
}
