import { TranslationTaskStatus } from '@prisma/client';

export interface TaskProcessingCompletedPayload {
  taskId: string;
  previousStatus?: TranslationTaskStatus;
  wordCount?: number;
  estimatedDurationSecs?: number | null;
}

export class TaskProcessingCompletedEvent {
  constructor(public readonly payload: TaskProcessingCompletedPayload) {}
}
