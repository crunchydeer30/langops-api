import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { TranslationTaskType } from '@prisma/client';
import { Queue } from 'bullmq';
import { TRANSLATION_TASK_PARSING_QUEUES } from '../../infrastructure/queues';

@Injectable()
export class TranslationTaskProcessingOrchestrator {
  constructor(
    @InjectQueue(TRANSLATION_TASK_PARSING_QUEUES.ORCHESTRATOR)
    private readonly orchestratorQueue: Queue,
  ) {}

  async startParsingFlow(
    taskId: string,
    taskType: TranslationTaskType,
  ): Promise<void> {
    console.log('ATTEMPTING TO START FLOW BY ADDING A JOB T QUEUE');
    await this.orchestratorQueue.add('startFlow', { taskId, taskType });
  }
}
