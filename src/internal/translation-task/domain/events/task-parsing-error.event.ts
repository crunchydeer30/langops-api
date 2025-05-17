import { TranslationTaskStatus } from '@prisma/client';

export class TaskParsingErrorEvent {
  constructor(
    public readonly taskId: string,
    public readonly previousStatus: TranslationTaskStatus,
    public readonly errorMessage: string,
  ) {}
}
