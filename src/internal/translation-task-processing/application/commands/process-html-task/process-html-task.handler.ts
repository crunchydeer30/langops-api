import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  IProcessHTMLTaskCommandResult,
  ProcessHTMLTaskCommand,
} from './process-html-task.command';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure';
import { HTMLParsingService, HTMLValidatorService } from '../../services';
import { TranslationTask } from 'src/internal/translation-task/domain';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories';
import { LanguagePair } from 'src/internal/language/domain';
import { TranslationTaskSegmentRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/translation-task-segment.repository';
import { SensitiveDataMappingRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/sensitive-data-mapping.repository';

// TODO: FULL REFACTOR
@CommandHandler(ProcessHTMLTaskCommand)
export class ProcessHTMLTaskHandler
  implements
    ICommandHandler<ProcessHTMLTaskCommand, IProcessHTMLTaskCommandResult>
{
  private readonly logger = new Logger(ProcessHTMLTaskHandler.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly htmlParsingService: HTMLParsingService,
    private readonly htmlValidatorService: HTMLValidatorService,
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly translationSegmentRepository: TranslationTaskSegmentRepository,
    private readonly sensitiveDataMappingsRepository: SensitiveDataMappingRepository,
  ) {}

  async execute({
    props,
  }: ProcessHTMLTaskCommand): Promise<IProcessHTMLTaskCommandResult> {
    const { taskId } = props;
    const task = await this.translationTaskRepository.findById(taskId);

    try {
      this.logger.log(`Processing html task ${taskId}`);

      if (!task) {
        throw new Error(`Failed to process task "${taskId}". Task not found`);
      }
      this.eventPublisher.mergeObjectContext(task);

      const languagePair = await this.languagePairRepository.findById(
        task.languagePairId,
      );
      if (!languagePair) {
        throw new Error(
          `Failed to process task "${taskId}". Language pair "${task.languagePairId}" not found`,
        );
      }

      task.startProcessing();
      await this.translationTaskRepository.save(task);

      this.validate(task);

      const { segments, originalStructure, sensitiveDataMappings } =
        await this.parse(task, languagePair);
      await this.translationSegmentRepository.saveMany(segments);
      await this.sensitiveDataMappingsRepository.saveMany(
        sensitiveDataMappings,
      );

      task.originalStructure = originalStructure;
      task.completeProcessing();
      await this.translationTaskRepository.save(task);
      task.commit();

      return {};
    } catch (e) {
      this.logger.error(
        `Failed to process html task ${taskId}: ${JSON.stringify(e)}`,
      );
      if (task) {
        task.handleProcessingError(JSON.stringify(e));
        await this.translationTaskRepository.save(task);
        task.commit();
      }
      throw e;
    }
  }

  private validate(task: TranslationTask) {
    try {
      this.htmlValidatorService.validate(task.originalContent);
    } catch {
      throw new Error(`Task ${task.id} failed HTML validation`);
    }
  }

  private async parse(task: TranslationTask, languagePair: LanguagePair) {
    try {
      return await this.htmlParsingService.parse(
        task.id,
        task.originalContent,
        languagePair.sourceLanguage.code,
      );
    } catch {
      throw new Error(`Failed to parse HTML ${task.id}`);
    }
  }
}
