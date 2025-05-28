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
import {
  ProcessTextTaskCommand,
  ProcessTextTaskResponse,
} from '../commands/process-text-task/process-text-task.command';
import {
  ProcessXliffTaskCommand,
  ProcessXliffTaskResponse,
} from '../commands/process-xliff-task';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { TranslationTaskSegmentRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/translation-task-segment.repository';
import { SensitiveDataMappingRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/sensitive-data-mapping.repository';
import { EventPublisher } from '@nestjs/cqrs';
import { TranslationTaskSegment } from '../../domain/entities/translation-task-segment.entity';
import { SensitiveDataMapping } from '../../domain/entities/sensitive-data-mapping.entity';

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
    await this.handleProcessing(job.data.taskId, job.data.taskType);
  }

  private async handleProcessing(
    taskId: string,
    taskType: TranslationTaskType,
  ) {
    const task = await this.translationTaskRepository.findById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    this.eventPublisher.mergeObjectContext(task);
    this.logger.debug(`Start processing translation task ${taskId}`);
    task.startProcessing();
    await this.translationTaskRepository.save(task);
    task.commit();

    try {
      // delegate processing based on task type
      let result:
        | ProcessHtmlTaskResponse
        | ProcessTextTaskResponse
        | ProcessXliffTaskResponse;
      switch (taskType) {
        case TranslationTaskType.PLAIN_TEXT:
          result = await this.commandBus.execute<
            ProcessTextTaskCommand,
            ProcessTextTaskResponse
          >(new ProcessTextTaskCommand({ taskId }));
          break;
        case TranslationTaskType.HTML:
          result = await this.commandBus.execute<
            ProcessHtmlTaskCommand,
            ProcessHtmlTaskResponse
          >(new ProcessHtmlTaskCommand({ taskId }));
          break;
        case TranslationTaskType.XLIFF:
          result = await this.commandBus.execute<
            ProcessXliffTaskCommand,
            ProcessXliffTaskResponse
          >(new ProcessXliffTaskCommand({ taskId }));
          break;
        default:
          throw new Error(`Unsupported task type: ${taskType}`);
      }

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
