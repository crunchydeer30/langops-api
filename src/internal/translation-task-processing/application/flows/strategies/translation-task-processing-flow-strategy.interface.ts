import { TranslationTaskType } from '@prisma/client';
import { FlowChildJob } from 'bullmq';

export interface TranslationTaskProcessingFlowStrategy {
  getTaskType(): TranslationTaskType;

  generateFlowConfig(taskId: string): FlowChildJob[];
}
