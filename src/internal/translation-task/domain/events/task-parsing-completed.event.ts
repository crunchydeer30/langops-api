import { TranslationTaskStatus } from '@prisma/client';

export class TaskParsingCompletedEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousStatus: TranslationTaskStatus,
    public readonly wordCount: number,
    public readonly estimatedDurationSecs: number | null,
  ) {}
}
