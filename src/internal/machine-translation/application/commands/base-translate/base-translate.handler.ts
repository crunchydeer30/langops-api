import { CommandBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { TranslationTaskSegmentRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/translation-task-segment.repository';
import {
  BaseTranslateCommand,
  IBaseTranslationResult,
} from './base-translate.command';
import { TranslationTask } from 'src/internal/translation-task/domain';
import { TranslationTaskSegment } from 'src/internal/translation-task-processing/domain/entities/translation-task-segment.entity';
import { PersistMachineTranslationsCommand } from '../persist-machine-translations';

export abstract class BaseTranslateHandler
  implements ICommandHandler<BaseTranslateCommand, void>
{
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly translationTaskSegmentRepository: TranslationTaskSegmentRepository,
    protected readonly commandBus: CommandBus,
  ) {}

  async execute(command: BaseTranslateCommand): Promise<void> {
    const { taskId } = command.params;

    try {
      const task = await this.translationTaskRepository.findById(taskId);
      if (!task) {
        this.logger.error(`Translation task ${taskId} not found`);
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

      // Execute the specific translation strategy
      const translationResult = await this.translate(task, segments);

      // Persist translation results using the dedicated command
      if (translationResult && translationResult.results.length > 0) {
        await this.commandBus.execute(
          new PersistMachineTranslationsCommand({
            taskId,
            results: translationResult.results,
          }),
        );
      }
    } catch (error) {
      this.logger.error(
        `Error executing translation command: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  abstract translate(
    task: TranslationTask,
    segments: TranslationTaskSegment[],
  ): Promise<IBaseTranslationResult>; // Figure out an interface for persisting the result later
}
