import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus, EventPublisher } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { TranslationTaskType } from '@prisma/client';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { BaseTranslateCommand } from '../../application/commands';
import { DeeplTranslateCommand } from 'src/integration/deepl/commands';
import {
  MACHINE_TRANSLATION_JOBS,
  MACHINE_TRANSLATION_QUEUE,
} from '../../infrastructure/bullmq/constants';

@Processor(MACHINE_TRANSLATION_QUEUE)
export class MachineTranslationProcessor extends WorkerHost {
  private readonly logger = new Logger(MachineTranslationProcessor.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly eventPublisher: EventPublisher,
  ) {
    super();
  }

  async process(
    job: Job<{
      taskId: string;
      taskType?: TranslationTaskType;
      childrenFailed?: { job: { name: string }; failedReason: string }[];
    }>,
  ) {
    const { taskId } = job.data;

    switch (job.name) {
      case MACHINE_TRANSLATION_JOBS.TRANSLATE.name:
        await this.translate(taskId);
        break;
      default:
        this.logger.error(
          `Unable to process job ${JSON.stringify(job)}. No handler found`,
        );
    }
  }

  private async translate(taskId: string) {
    const task = await this.translationTaskRepository.findById(taskId);
    try {
      this.logger.log(`Starting machine translation for task ${taskId}`);
      if (!task) {
        throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
      }
      this.eventPublisher.mergeObjectContext(task);

      task.startMachineTranslation();
      await this.translationTaskRepository.save(task);
      task.commit();

      const translationCommand: BaseTranslateCommand =
        new DeeplTranslateCommand({ taskId });

      await this.commandBus.execute(translationCommand);

      task.completeMachineTranslation();
      await this.translationTaskRepository.save(task);
      task.commit();

      this.logger.log(`Machine translation completed for task ${taskId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process machine translation for task ${taskId}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      if (task) {
        task.handleProcessingError(JSON.stringify(error));
        await this.translationTaskRepository.save(task);
        task.commit();
      }
      throw error;
    }
  }
}
