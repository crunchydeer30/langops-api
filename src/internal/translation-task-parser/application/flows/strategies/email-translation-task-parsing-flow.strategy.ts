import { Injectable, Logger } from '@nestjs/common';
import { TranslationTaskType } from '@prisma/client';
import { FlowJob } from 'bullmq';
import { TranslationTaskParsingFlowStrategy } from './translation-task-parsing-flow-strategy.interface';
import {
  TRANSLATION_TASK_PARSING_FLOWS,
  TRANSLATION_TASK_PARSING_QUEUES,
} from '../../../infrastructure/queues/constants';

@Injectable()
export class EmailTranslationTaskParsingFlowStrategy
  implements TranslationTaskParsingFlowStrategy
{
  private readonly logger = new Logger(
    EmailTranslationTaskParsingFlowStrategy.name,
  );

  getTaskType(): TranslationTaskType {
    return TranslationTaskType.EMAIL;
  }

  generateFlowConfig(taskId: string): FlowJob {
    this.logger.log(
      `Generating flow config for email translation task ${taskId}`,
    );

    return {
      name: `${TRANSLATION_TASK_PARSING_FLOWS.EMAIL.name}:${taskId}`,
      queueName: TRANSLATION_TASK_PARSING_QUEUES.EMAIL,
      data: { taskId },
      children: [
        {
          name: 'log-email-task',
          data: { taskId },
          queueName: TRANSLATION_TASK_PARSING_QUEUES.EMAIL,
        },
      ],
    };
  }
}
