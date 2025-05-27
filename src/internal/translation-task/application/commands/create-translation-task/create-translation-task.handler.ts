import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  CreateTranslationTaskCommand,
  ICreateTranslationTaskCommandResult,
} from './create-translation-task.command';
import { TranslationTask } from '../../../domain/entities/translation-task.entity';
import { TranslationTaskRepository } from '../../../infrastructure/repositories/translation-task.repository';
import { TranslationTaskStatus } from '@prisma/client';

@CommandHandler(CreateTranslationTaskCommand)
export class CreateTranslationTaskHandler
  implements
    ICommandHandler<
      CreateTranslationTaskCommand,
      ICreateTranslationTaskCommandResult
    >
{
  private readonly logger = new Logger(CreateTranslationTaskHandler.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute({
    props,
  }: CreateTranslationTaskCommand): Promise<ICreateTranslationTaskCommandResult> {
    this.logger.log(`Creating translation task for type: ${props.formatType}`);

    const translationTask = TranslationTask.create({
      languagePairId: props.languagePairId,
      originalContent: props.originalContent,
      originalStructure: props.originalStructure ?? null,
      taskType: props.formatType,
      status: TranslationTaskStatus.NEW,
    });

    const taskWithEvents = this.publisher.mergeObjectContext(translationTask);

    await this.translationTaskRepository.save(translationTask);

    taskWithEvents.commit();

    this.logger.log(
      `Translation task created successfully with ID: ${translationTask.id}`,
    );

    return { id: translationTask.id };
  }
}
