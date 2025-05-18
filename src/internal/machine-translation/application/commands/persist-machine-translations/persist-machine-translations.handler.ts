import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { TranslationTaskSegmentRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/translation-task-segment.repository';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { TranslationTaskSegment } from 'src/internal/translation-task-processing/domain/entities/translation-task-segment.entity';
import { PersistMachineTranslationsCommand } from './persist-machine-translations.command';

@Injectable()
@CommandHandler(PersistMachineTranslationsCommand)
export class PersistMachineTranslationsHandler
  implements ICommandHandler<PersistMachineTranslationsCommand, void>
{
  private readonly logger = new Logger(PersistMachineTranslationsHandler.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly translationTaskSegmentRepository: TranslationTaskSegmentRepository,
  ) {}

  async execute(command: PersistMachineTranslationsCommand): Promise<void> {
    const { taskId, results } = command.params;

    if (!results || results.length === 0) {
      this.logger.warn(`No translation results to persist for task ${taskId}`);
      return;
    }

    try {
      this.logger.log(
        `Persisting ${results.length} machine translation results for task ${taskId}`,
      );

      const task = await this.translationTaskRepository.findById(taskId);
      if (!task) {
        this.logger.error(
          `Translation task ${taskId} not found for persisting translations`,
        );
        return;
      }

      const segments =
        await this.translationTaskSegmentRepository.findByTranslationTaskId(
          taskId,
        );
      if (!segments || segments.length === 0) {
        this.logger.error(`No segments found for translation task ${taskId}`);
        return;
      }

      const segmentsMap = new Map(
        segments.map((segment) => [segment.id, segment]),
      );
      const updatedSegments: TranslationTaskSegment[] = [];

      for (const result of results) {
        const segment = segmentsMap.get(result.segmentId);
        if (!segment) {
          this.logger.warn(
            `Segment ${result.segmentId} not found for task ${taskId}, skipping`,
          );
          continue;
        }

        segment.machineTranslatedContent = result.translatedText;
        segment.updatedAt = new Date();
        updatedSegments.push(segment);
      }

      if (updatedSegments.length === 0) {
        this.logger.warn(`No segments updated for task ${taskId}`);
        return;
      }

      await this.translationTaskSegmentRepository.saveMany(updatedSegments);
      this.logger.log(
        `Persisted translations for ${updatedSegments.length} segments`,
      );

      task.completeMachineTranslation();
      await this.translationTaskRepository.save(task);
      task.commit();

      this.logger.log(
        `Updated task ${taskId} status to indicate machine translation is complete`,
      );
    } catch (error) {
      this.logger.error(
        `Error persisting machine translations for task ${taskId}: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
