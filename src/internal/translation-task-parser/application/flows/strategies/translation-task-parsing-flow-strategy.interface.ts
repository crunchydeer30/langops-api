import { TranslationTaskType } from '@prisma/client';
import { FlowJob } from 'bullmq';

export interface TranslationTaskParsingFlowStrategy {
  getTaskType(): TranslationTaskType;

  generateFlowConfig(taskId: string): FlowJob;
}
