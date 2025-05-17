import { TranslationTaskStatus } from '@prisma/client';

/**
 * Event emitted when a translation task has been successfully parsed
 */
export class TaskParsingCompletedEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousStatus: TranslationTaskStatus,
    public readonly wordCount: number,
    public readonly estimatedDurationSecs: number | null,
  ) {}
}
