import { Injectable, Logger } from '@nestjs/common';
import { TranslationTaskType } from '@prisma/client';
import { FlowChildJob } from 'bullmq';
import { TranslationTaskProcessingFlowStrategy } from './translation-task-processing-flow-strategy.interface';
import {
  TRANSLATION_TASK_PARSING_FLOWS,
  TRANSLATION_TASK_PARSING_QUEUES,
} from '../../../infrastructure/queues/constants';

@Injectable()
export class HTMLProcessingFlowStrategy
  implements TranslationTaskProcessingFlowStrategy
{
  private readonly logger = new Logger(HTMLProcessingFlowStrategy.name);

  getTaskType(): TranslationTaskType {
    return TranslationTaskType.HTML;
  }

  generateFlowConfig(taskId: string): FlowChildJob[] {
    this.logger.log(
      `Generating flow config for html translation task ${taskId}`,
    );

    return [
      {
        name: TRANSLATION_TASK_PARSING_FLOWS.HTML.JOBS.PARSE.name,
        data: { taskId },
        queueName: TRANSLATION_TASK_PARSING_QUEUES.HTML_JOBS,
        opts: { failParentOnFailure: true },
        children: [
          {
            name: TRANSLATION_TASK_PARSING_FLOWS.HTML.JOBS.VALIDATE.name,
            data: { taskId },
            queueName: TRANSLATION_TASK_PARSING_QUEUES.HTML_JOBS,
            opts: { failParentOnFailure: true },
          },
        ],
      },
    ];
  }
}
