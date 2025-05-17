import { TranslationTaskStatus, TranslationStage } from '@prisma/client';

export interface TaskCompletedPayload {
  taskId: string;
  previousStatus: TranslationTaskStatus;
  previousStage: TranslationStage;
  editorId: string | null;
}

export class TaskCompletedEvent {
  constructor(public readonly payload: TaskCompletedPayload) {}
}
