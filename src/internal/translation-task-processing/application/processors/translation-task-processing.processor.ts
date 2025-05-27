import { Processor, WorkerHost } from '@nestjs/bullmq';
import { TRANSLATION_TASK_PROCESSING_QUEUE } from '../../infrastructure/queues';
import { Job } from 'bullmq';
import { TranslationTaskType } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ProcessHtmlTaskCommand,
  ProcessHtmlTaskResponse,
} from '../commands/process-html-task/process-html-task.command';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { TranslationTaskSegmentRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/translation-task-segment.repository';
import { SensitiveDataMappingRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/sensitive-data-mapping.repository';
import { EventPublisher } from '@nestjs/cqrs';
import { TranslationTaskSegment } from '../../domain/entities/translation-task-segment.entity';
import { SensitiveDataMapping } from '../../domain/entities/sensitive-data-mapping.entity';
import {
  ProcessXliffTaskCommand,
  ProcessXliffTaskResponse,
} from '../commands/process-xliff-task';

@Processor(TRANSLATION_TASK_PROCESSING_QUEUE, {})
export class TranslationTaskProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(TranslationTaskProcessingProcessor.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly translationSegmentRepository: TranslationTaskSegmentRepository,
    private readonly sensitiveDataMappingRepository: SensitiveDataMappingRepository,
    private readonly eventPublisher: EventPublisher,
  ) {
    super();
  }

  async process(
    job: Job<{ taskId: string; taskType: TranslationTaskType }, any, string>,
  ): Promise<void> {
    await this.handleProcessing(job.data.taskId);
  }

  private async handleProcessing(taskId: string) {
    const task = await this.translationTaskRepository.findById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    this.eventPublisher.mergeObjectContext(task);
    this.logger.debug(`Start processing translation task ${taskId}`);
    task.startProcessing();
    await this.translationTaskRepository.save(task);
    task.commit();

    try {
      const result = await this.commandBus.execute<
        ProcessXliffTaskCommand,
        ProcessXliffTaskResponse
      >(new ProcessXliffTaskCommand({ taskId }));

      const segments = result.segmentArgs.map((args) => {
        return TranslationTaskSegment.create({
          ...args,
          specialTokensMap: args.specialTokensMap || undefined,
          formatMetadata: args.formatMetadata || undefined,
        });
      });

      const sensitiveDataMappings = result.sensitiveDataMappingArgs.map(
        (args) => SensitiveDataMapping.create(args),
      );

      await this.translationSegmentRepository.saveMany(segments);
      await this.sensitiveDataMappingRepository.saveMany(sensitiveDataMappings);

      task.originalStructure = result.originalStructure;
      task.completeProcessing();
      await this.translationTaskRepository.save(task);
      task.commit();
    } catch (error) {
      this.logger.error(
        `Error during translation task ${taskId} processing: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
      task.handleProcessingError(
        error instanceof Error ? error.message : String(error),
      );
      await this.translationTaskRepository.save(task);
      task.commit();
      throw error;
    }
  }
}
