import { Logger } from '@nestjs/common';

export class EvaluationTaskCompletedEvent {
  private readonly logger = new Logger(EvaluationTaskCompletedEvent.name);

  constructor(
    public readonly payload: {
      taskId: string;
      editorId: string;
    },
  ) {}
}
