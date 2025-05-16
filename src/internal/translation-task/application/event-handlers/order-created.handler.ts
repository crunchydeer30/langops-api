import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { OrderCreatedEvent } from 'src/internal/order/domain/events';
import { OrderType, TranslationTaskType } from '@prisma/client';
import { CreateTranslationTaskCommand } from '../commands/create-translation-task/create-translation-task.command';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(`Processing order created event: ${event.payload.orderId}`);

    switch (event.payload.type) {
      case OrderType.EMAIL:
        await this.handleEmailOrder(event);
        break;
      case OrderType.PLAIN_TEXT:
        await this.handlePlainTextOrder(event);
        break;
      default:
        this.logger.error(
          `Unsupported order type: ${event.payload.type as string}`,
        );
        throw new DomainException(ERRORS.ORDER.INVALID_ORDER_TYPE);
    }
  }

  private async handleEmailOrder(event: OrderCreatedEvent): Promise<void> {
    const { orderId, languagePairId, sourceContent } = event.payload;

    this.logger.log(`Creating email translation task for order: ${orderId}`);

    if (!sourceContent) {
      this.logger.error(
        `Missing source content for email translation task, order: ${orderId}`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.MISSING_SOURCE_CONTENT);
    }

    try {
      await this.commandBus.execute(
        new CreateTranslationTaskCommand({
          orderId,
          languagePairId,
          sourceContent,
          taskType: TranslationTaskType.EMAIL,
        }),
      );

      this.logger.log(
        `Successfully created email translation task for order: ${orderId}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create email translation task for order: ${orderId}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof DomainException) {
        throw error;
      } else {
        throw new DomainException(ERRORS.TRANSLATION_TASK.CREATION_FAILED);
      }
    }
  }

  private async handlePlainTextOrder(event: OrderCreatedEvent): Promise<void> {
    const { orderId, languagePairId, sourceContent } = event.payload;

    this.logger.log(
      `Creating plain text translation task for order: ${orderId}`,
    );

    if (!sourceContent) {
      this.logger.error(
        `Missing source content for plain text translation task, order: ${orderId}`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.MISSING_SOURCE_CONTENT);
    }

    try {
      await this.commandBus.execute(
        new CreateTranslationTaskCommand({
          orderId,
          languagePairId,
          sourceContent,
          taskType: TranslationTaskType.PLAIN_TEXT,
        }),
      );

      this.logger.log(
        `Successfully created plain text translation task for order: ${orderId}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create plain text translation task for order: ${orderId}`,
        error instanceof Error ? error.stack : String(error),
      );

      if (error instanceof DomainException) {
        throw error;
      } else {
        throw new DomainException(ERRORS.TRANSLATION_TASK.CREATION_FAILED);
      }
    }
  }
}
