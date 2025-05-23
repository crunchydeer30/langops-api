import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTranslationCommand } from './create-translation.command';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common';
import { Order } from 'src/internal/order/domain/entities/order.entity';
import { TranslationTask } from 'src/internal/translation-task/domain/entities/translation-task.entity';
import { TranslationStage, TranslationTaskStatus } from '@prisma/client';
import { CreateTranslationCommand as CreateTranslationContract } from 'libs/contracts/translation';
import { OrderRepository } from 'src/internal/order/infrastructure';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure';
import { TranslationStatus } from '@libs/contracts/translation/enums';
import { CreateTranslationResponseDto } from '../../dto';

@CommandHandler(CreateTranslationCommand)
export class CreateTranslationHandler
  implements ICommandHandler<CreateTranslationCommand>
{
  private readonly logger = new Logger(CreateTranslationHandler.name);

  constructor(
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly orderRepository: OrderRepository,
    private readonly translationTaskRepository: TranslationTaskRepository,
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

      const order = Order.create({
        customerId,
        languagePairId: languagePair.id,
      });

      await this.orderRepository.save(order);

      const task = TranslationTask.create({
        originalContent: text,
        taskType: format,
        originalStructure: null,
        orderId: order.id,
        languagePairId: languagePair.id,
        status: TranslationTaskStatus.NEW,
        currentStage: TranslationStage.QUEUED_FOR_PROCESSING,
      });

      const taskWithEvents = this.publisher.mergeObjectContext(task);
      await this.translationTaskRepository.save(taskWithEvents);
      taskWithEvents.commit();

      const response: CreateTranslationResponseDto = {
        id: task.id,
        orderId: order.id,
        price: 0,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        text: text,
        format,
        status: task.status as TranslationStatus,
      };

      this.logger.log(
        `Created translation task ${task.id} for order ${order.id}`,
      );

      return response;
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }

      this.logger.error(
        `Failed to create translation: ${JSON.stringify(error)}`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.CREATION_FAILED);
    }
  }
}
