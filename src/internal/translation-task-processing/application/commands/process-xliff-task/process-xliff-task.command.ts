import { BaseProcessTaskCommand } from '../base-process-task';
import {
  BaseProcessTaskCommandParams,
  BaseProcessTaskResponse,
} from '../base-process-task';

export type ProcessXliffTaskCommandParams = BaseProcessTaskCommandParams;

export type ProcessXliffTaskResponse = BaseProcessTaskResponse;

export class ProcessXliffTaskCommand extends BaseProcessTaskCommand {}
