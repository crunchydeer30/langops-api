import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTranslationCommand } from './create-translation.command';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common';
import { CreateTranslationCommand as CreateTranslationContract } from 'libs/contracts/translation';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories';
import { TranslationStatus as TranslationStatusEnum } from '@libs/contracts/translation/enums';
import { CreateTranslationResponseDto } from '../../dto';
import { Translation } from 'src/internal/translation/domain/entities';
import { TranslationRepository } from 'src/internal/translation/infrastructure/repositories';

@CommandHandler(CreateTranslationCommand)
export class CreateTranslationHandler
  implements ICommandHandler<CreateTranslationCommand>
{
  private readonly logger = new Logger(CreateTranslationHandler.name);

  constructor(
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly translationRepository: TranslationRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: CreateTranslationCommand,
  ): Promise<CreateTranslationContract.Response> {
    const { customerId, sourceLanguage, targetLanguage, text, format } =
      command.payload;

    this.logger.log(`Creating translation for customer ${customerId}`);

    try {
      const languagePair =
        await this.languagePairRepository.findByLanguageCodes(
          sourceLanguage,
          targetLanguage,
        );

      if (!languagePair) {
        this.logger.warn(`Can't create translation: language pair not found`);
        throw new DomainException(
          ERRORS.TRANSLATION_TASK.INVALID_LANGUAGE_CODES,
        );
      }

      const translation = Translation.create({
        customerId,
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
        originalContent: text,
        format,
      });

      const translationWithEvents =
        this.publisher.mergeObjectContext(translation);
      await this.translationRepository.save(translationWithEvents);
      translationWithEvents.commit();

      const response: CreateTranslationResponseDto = {
        id: translation.id,
        price: 0,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        text: text,
        format,
        status: TranslationStatusEnum.NEW,
      };

      this.logger.log(
        `Created translation ${translation.id} for customer ${customerId}`,
      );

      return response;
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }

      this.logger.error(
        `Failed to create translation: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new DomainException(ERRORS.TRANSLATION.CREATION_FAILED);
    }
  }
}
