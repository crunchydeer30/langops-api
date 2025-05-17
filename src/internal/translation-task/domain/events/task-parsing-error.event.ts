import { TranslationTaskStatus } from '@prisma/client';

export interface TaskParsingErrorPayload {
  taskId: string;
  previousStatus: TranslationTaskStatus;
  errorMessage: string;
}

export class TaskParsingErrorEvent {
  constructor(public readonly payload: TaskParsingErrorPayload) {}
}
