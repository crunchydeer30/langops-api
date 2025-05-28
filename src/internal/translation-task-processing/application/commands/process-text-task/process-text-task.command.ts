import {
  BaseProcessTaskCommand,
  BaseProcessTaskCommandParams,
  BaseProcessTaskResponse,
} from '../base-process-task';

export type ProcessTextTaskCommandParams = BaseProcessTaskCommandParams;
export type ProcessTextTaskResponse = BaseProcessTaskResponse;

export class ProcessTextTaskCommand extends BaseProcessTaskCommand {}
