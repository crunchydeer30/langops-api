import { TranslationTaskStatus, TranslationStage } from '@prisma/client';

export interface TaskMachineTranslationStartedPayload {
  taskId: string;
  previousStatus: TranslationTaskStatus;
  previousStage: TranslationStage;
}

export class TaskMachineTranslationStartedEvent {
  constructor(public readonly payload: TaskMachineTranslationStartedPayload) {}
}
