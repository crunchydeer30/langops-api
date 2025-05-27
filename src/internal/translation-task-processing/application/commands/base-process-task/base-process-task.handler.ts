import { CommandBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import {
  BaseProcessTaskCommand,
  BaseProcessTaskResponse,
} from './base-process-task.command';

export abstract class BaseProcessTaskHandler
  implements ICommandHandler<BaseProcessTaskCommand, BaseProcessTaskResponse>
{
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: BaseProcessTaskCommand,
  ): Promise<BaseProcessTaskResponse> {
    const { taskId } = command.params;

    try {
      // Fetch task - this is common for all processors
      const task = await this.translationTaskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Failed to process task "${taskId}". Task not found`);
      }

      this.logger.log(`Processing task ${taskId}`);

      // Call the abstract method that concrete implementations will provide
      return await this.process(task);
    } catch (error) {
      this.logger.error(
        `Error processing task ${taskId}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  // This is what concrete strategies will implement
  protected abstract process(task: any): Promise<BaseProcessTaskResponse>;
}
