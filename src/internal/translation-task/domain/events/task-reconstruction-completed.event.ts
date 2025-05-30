import { TranslationStage, TranslationTaskStatus } from '@prisma/client';

export interface TaskReconstructionCompletedEventPayload {
  taskId: string;
  previousStatus: TranslationTaskStatus;
  previousStage: TranslationStage;
}

export class TaskReconstructionCompletedEvent {
  constructor(
    public readonly payload: TaskReconstructionCompletedEventPayload,
  ) {}
}
