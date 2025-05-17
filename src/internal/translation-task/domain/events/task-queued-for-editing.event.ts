import { TranslationTaskStatus, TranslationStage } from '@prisma/client';

export interface TaskQueuedForEditingPayload {
  taskId: string;
  previousStatus: TranslationTaskStatus;
  previousStage: TranslationStage;
}

export class TaskQueuedForEditingEvent {
  constructor(public readonly payload: TaskQueuedForEditingPayload) {}
}
