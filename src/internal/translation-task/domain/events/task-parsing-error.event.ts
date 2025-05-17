import { TranslationTaskStatus } from '@prisma/client';

/**
 * Event emitted when a translation task encounters an error during parsing
 */
export class TaskParsingErrorEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousStatus: TranslationTaskStatus,
    public readonly errorMessage: string,
  ) {}
}
