import { TranslationTaskStatus } from '@prisma/client';

export interface TaskRejectedPayload {
  taskId: string;
  previousStatus: TranslationTaskStatus;
  rejectionReason: string;
}

export class TaskRejectedEvent {
  constructor(public readonly payload: TaskRejectedPayload) {}
}
