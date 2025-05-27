import {
  BaseProcessTaskCommand,
  BaseProcessTaskCommandParams,
  BaseProcessTaskResponse,
} from '../base-process-task';

export type ProcessHtmlTaskCommandParams = BaseProcessTaskCommandParams;

export type ProcessHtmlTaskResponse = BaseProcessTaskResponse;

export class ProcessHtmlTaskCommand extends BaseProcessTaskCommand {}
