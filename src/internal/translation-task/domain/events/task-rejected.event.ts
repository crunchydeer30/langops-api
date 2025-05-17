import { TranslationTaskStatus } from '@prisma/client';

/**
 * Event emitted when a translation task is rejected due to validation failure
 * or other critical issues that prevent it from being processed
 */
export class TaskRejectedEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousStatus: TranslationTaskStatus,
    public readonly rejectionReason: string,
  ) {}
}
