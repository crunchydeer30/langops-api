import { TranslationTaskStatus, TranslationStage } from '@prisma/client';

export interface TaskProcessingStartedPayload {
  taskId: string;
  previousStatus: TranslationTaskStatus;
  previousStage: TranslationStage;
}

export class TaskProcessingStartedEvent {
  constructor(public readonly payload: TaskProcessingStartedPayload) {}
}
