import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus, EventPublisher } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  MACHINE_TRANSLATION_JOBS,
  MACHINE_TRANSLATION_QUEUE,
} from '../../infrastructure/bullmq/constants';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { TranslationTaskSegmentRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/translation-task-segment.repository';
import { DeeplTranslateCommand } from 'src/integration/deepl/commands/deepl-translate/deepl-translate.command';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import {
  BaseTranslateCommand,
  IBaseTranslationResult,
  TranslationSegment,
} from '../commands/base-translate/base-translate.command';
import { TranslationTaskType } from '@prisma/client';
import { TranslationTaskSegment } from 'src/internal/translation-task-processing/domain/entities/translation-task-segment.entity';
import { LanguageRepository } from 'src/internal/language/infrastructure/repositories/language.repository';
import { TranslationTask } from 'src/internal/translation-task/domain';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories';

@Processor(MACHINE_TRANSLATION_QUEUE)
export class MachineTranslationProcessor extends WorkerHost {
  private readonly logger = new Logger(MachineTranslationProcessor.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly translationTaskSegmentRepository: TranslationTaskSegmentRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly languageRepository: LanguageRepository,
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

      const languagePair = await this.getLanguagePair(task);
      const { sourceLanguage, targetLanguage } = languagePair;

      const segments =
        await this.translationTaskSegmentRepository.findByTranslationTaskId(
          taskId,
        );

      if (!segments || segments.length === 0) {
        this.logger.error(
          `Failed to find translation segments for task ${taskId}`,
        );
        throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
      }

      const translationSegments: TranslationSegment[] = segments.map(
        (segment) => ({
          id: segment.id,
          content: segment.anonymizedContent || segment.sourceContent,
          formatMetadata: segment.formatMetadata || undefined,
        }),
      );

      task.startMachineTranslation();
      await this.translationTaskRepository.save(task);
      task.commit();

      const translationCommand = new DeeplTranslateCommand({
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        segments: translationSegments,
      });

      const translationResult = await this.commandBus.execute<
        BaseTranslateCommand,
        IBaseTranslationResult
      >(translationCommand);

      await this.processMachineTranslationResults(taskId, translationResult);

      task.completeMachineTranslation();
      await this.translationTaskRepository.save(task);
      task.commit();

      this.logger.log(`Machine translation completed for task ${taskId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process machine translation for task ${taskId}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      if (task) {
        task.handleProcessingError(
          error instanceof Error ? error.message : JSON.stringify(error),
        );
        await this.translationTaskRepository.save(task);
        task.commit();
      }
      throw error;
    }
  }

  private async processMachineTranslationResults(
    taskId: string,
    translationResult: IBaseTranslationResult,
  ): Promise<void> {
    if (
      !translationResult ||
      !translationResult.results ||
      translationResult.results.length === 0
    ) {
      this.logger.warn(`No translation results to process for task ${taskId}`);
      return;
    }

    this.logger.debug(
      `Processing ${translationResult.results.length} translation results for task ${taskId}`,
    );

    const segments =
      await this.translationTaskSegmentRepository.findByTranslationTaskId(
        taskId,
      );

    if (!segments || segments.length === 0) {
      this.logger.warn(`No segments found for task ${taskId}`);
      return;
    }

    const segmentMap = new Map<string, TranslationTaskSegment>();
    segments.forEach((segment) => {
      segmentMap.set(segment.id, segment);
    });

    let updatedCount = 0;
    const translationUpdates: Array<{ id: string; content: string }> = [];

    for (const result of translationResult.results) {
      const { segmentId, translatedText } = result;
      const segment = segmentMap.get(segmentId);

      if (!segment) {
        this.logger.warn(`Segment ${segmentId} not found for task ${taskId}`);
        continue;
      }

      translationUpdates.push({
        id: segmentId,
        content: translatedText,
      });
      updatedCount++;
    }

    for (const update of translationUpdates) {
      const segment = segmentMap.get(update.id);
      if (segment) {
        segment.machineTranslatedContent = update.content;
        await this.translationTaskSegmentRepository.save(segment);
      }
    }

    this.logger.debug(
      `Saved ${updatedCount} translated segments for task ${taskId}`,
    );
  }

  private async getLanguagePair(
    task: TranslationTask,
  ): Promise<{ sourceLanguage: string; targetLanguage: string }> {
    if (!task.languagePairId) {
      this.logger.error(`Task ${task.id} does not have a language pair ID`);
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
    }

    const languagePair = await this.languagePairRepository.findById(
      task.languagePairId,
    );

    if (!languagePair) {
      this.logger.error(
        `Language pair with ID ${task.languagePairId} not found`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
    }

    const sourceLanguage = await this.languageRepository.findById(
      languagePair.sourceLanguageId,
    );
    if (!sourceLanguage) {
      this.logger.error(
        `Source language with ID ${languagePair.sourceLanguageId} not found`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
    }

    const targetLanguage = await this.languageRepository.findById(
      languagePair.targetLanguageId,
    );
    if (!targetLanguage) {
      this.logger.error(
        `Target language with ID ${languagePair.targetLanguageId} not found`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
    }

    return {
      sourceLanguage: sourceLanguage.code,
      targetLanguage: targetLanguage.code,
    };
  }
}
