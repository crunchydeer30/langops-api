import { TranslationTaskType } from '@prisma/client';
import { FlowJob } from 'bullmq';

/**
 * Interface for translation task parsing flow strategies
 */
export interface TranslationTaskParsingFlowStrategy {
  /**
   * Get task type that this strategy handles
   */
  getTaskType(): TranslationTaskType;

  /**
   * Generate flow job configuration for this task type
   */
  generateFlowConfig(taskId: string): FlowJob;
}
