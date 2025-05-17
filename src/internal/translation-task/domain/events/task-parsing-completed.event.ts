import { TranslationTaskStatus } from '@prisma/client';

export interface TaskParsingCompletedPayload {
  taskId: string;
  previousStatus: TranslationTaskStatus;
  wordCount: number;
  estimatedDurationSecs: number | null;
}

export class TaskParsingCompletedEvent {
  constructor(public readonly payload: TaskParsingCompletedPayload) {}
}
