import { TranslationTaskStatus } from '@prisma/client';

export interface TaskProcessingCompletedPayload {
  taskId: string;
  previousStatus?: TranslationTaskStatus;
}

export class TaskProcessingCompletedEvent {
  constructor(public readonly payload: TaskProcessingCompletedPayload) {}
}
