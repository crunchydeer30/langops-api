import { TranslationTaskStatus } from '@prisma/client';

export class TaskRejectedEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousStatus: TranslationTaskStatus,
    public readonly rejectionReason: string,
  ) {}
}
