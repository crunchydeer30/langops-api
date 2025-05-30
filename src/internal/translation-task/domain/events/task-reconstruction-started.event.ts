import { TranslationStage, TranslationTaskStatus } from '@prisma/client';

export interface TaskReconstructionStartedEventPayload {
  taskId: string;
  editorId: string;
  previousStatus: TranslationTaskStatus;
  previousStage: TranslationStage;
}

export class TaskReconstructionStartedEvent {
  constructor(public readonly payload: TaskReconstructionStartedEventPayload) {}
}
