import { EventPublisher, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TranslationCreatedEvent } from 'src/internal/translation/domain/entities';
import { TranslationTask } from 'src/internal/translation-task/domain/entities/translation-task.entity';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure';
import { TranslationRepository } from 'src/internal/translation/infrastructure/repositories';
import { TranslationStage, TranslationTaskStatus } from '@prisma/client';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common';

@EventsHandler(TranslationCreatedEvent)
export class TranslationCreatedHandler
  implements IEventHandler<TranslationCreatedEvent>
{
  private readonly logger = new Logger(TranslationCreatedHandler.name);

  constructor(
    private readonly translationRepository: TranslationRepository,
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(event: TranslationCreatedEvent): Promise<void> {
    const { translation } = event;
    this.logger.log(
      `Handling TranslationCreatedEvent for translation ${translation.id}`,
    );

    try {
      this.logger.debug(`TRNALTION CREATED HANDER`);
      const languagePair =
        await this.languagePairRepository.findByLanguageCodes(
          translation.sourceLanguageCode,
          translation.targetLanguageCode,
        );

      if (!languagePair) {
        this.logger.warn(`Language pair not found`);
        throw new DomainException(
          ERRORS.TRANSLATION_TASK.INVALID_LANGUAGE_CODES,
        );
      }

      const task = TranslationTask.create({
        originalContent: translation.originalContent,
        taskType: translation.format,
        originalStructure: null,
        languagePairId: languagePair.id,
        status: TranslationTaskStatus.NEW,
        currentStage: TranslationStage.QUEUED_FOR_PROCESSING,
      });

      this.eventPublisher.mergeObjectContext(task);

      await this.translationTaskRepository.save(task);

      translation.assignTranslationTask(task.id);
      await this.translationRepository.save(translation);
      task.commit();

      this.logger.log(
        `Created TranslationTask ${task.id} for Translation ${translation.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process TranslationCreatedEvent: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (!(error instanceof DomainException)) {
        throw new DomainException(ERRORS.TRANSLATION_TASK.CREATION_FAILED);
      }
      throw error;
    }
  }
}
