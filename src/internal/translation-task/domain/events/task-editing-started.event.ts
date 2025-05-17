import { TranslationTaskStatus, TranslationStage } from '@prisma/client';

export interface TaskEditingStartedPayload {
  taskId: string;
  previousStatus: TranslationTaskStatus;
  previousStage: TranslationStage;
  editorId: string | null;
}

export class TaskEditingStartedEvent {
  constructor(public readonly payload: TaskEditingStartedPayload) {}
}
