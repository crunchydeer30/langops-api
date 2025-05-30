import {
  BaseReconstructTaskCommand,
  BaseReconstructTaskResponse,
} from '../base-reconstruct-task';

export class ReconstructTextTaskCommand extends BaseReconstructTaskCommand {
  constructor(public readonly taskId: string) {
    super(taskId);
  }
}

export type ReconstructTextTaskResponse = BaseReconstructTaskResponse;
