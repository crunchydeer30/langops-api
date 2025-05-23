export interface TaskParsingErrorPayload {
  taskId: string;
  errorMessage: string;
}

export class TaskParsingErrorEvent {
  constructor(public readonly payload: TaskParsingErrorPayload) {}
}
