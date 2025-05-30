import { CommandBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { ISensitiveDataMappingRepository } from '../../../domain/ports/sensitive-data-mapping.repository';
import { ITranslationTaskSegmentRepository } from '../../../domain/ports/translation-task-segment.repository';
import { TranslationTask } from 'src/internal/translation-task/domain';
import { SegmentDto } from '../../services/html-parsing.service';
import {
  BaseReconstructTaskCommand,
  BaseReconstructTaskResponse,
} from './base-reconstruct-task.command';

export abstract class BaseReconstructTaskHandler
  implements
    ICommandHandler<BaseReconstructTaskCommand, BaseReconstructTaskResponse>
{
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly segmentRepository: ITranslationTaskSegmentRepository,
    protected readonly sensitiveDataMappingRepository: ISensitiveDataMappingRepository,
    protected readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: BaseReconstructTaskCommand,
  ): Promise<BaseReconstructTaskResponse> {
    const { taskId } = command;

    try {
      const task = await this.translationTaskRepository.findById(taskId);
      if (!task) {
        throw new Error(
          `Failed to reconstruct task "${taskId}". Task not found`,
        );
      }

      this.logger.log(`Reconstructing task ${taskId}`);

      // Get segments from the segment repository
      const segmentEntities =
        await this.segmentRepository.findByTranslationTaskId(taskId);

      // Convert to DTOs for processing
      const segments: SegmentDto[] = segmentEntities.map((segment) => ({
        id: segment.id,
        segmentOrder: segment.segmentOrder,
        segmentType: segment.segmentType,
        sourceContent: segment.sourceContent,
        // Only use machineTranslatedContent for now
        targetContent: segment.machineTranslatedContent || undefined,
        specialTokensMap: segment.specialTokensMap || undefined,
        formatMetadata: segment.formatMetadata || undefined,
      }));

      const finalContent = await this.reconstruct(task, segments);

      // Update the task with the final content using the domain method
      // task.completeReconstruction(finalContent);
      // await this.translationTaskRepository.save(task);

      return {
        taskId: task.id,
        finalContent,
      };
    } catch (error) {
      this.logger.error(
        `Error reconstructing task ${taskId}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  protected abstract reconstruct(
    task: TranslationTask,
    segments: SegmentDto[],
  ): Promise<string>;
}
