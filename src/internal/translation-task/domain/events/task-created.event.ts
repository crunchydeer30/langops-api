import { TranslationTaskType } from '@prisma/client';

export interface TaskCreatedPayload {
  taskId: string;
  taskType: TranslationTaskType;
}

export class TaskCreatedEvent {
  constructor(public readonly payload: TaskCreatedPayload) {}
}
