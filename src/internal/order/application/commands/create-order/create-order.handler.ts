import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  CreateOrderCommand,
  ICreateOrderCommandResult,
} from './create-order.command';
import { Order } from '../../../domain/entities/order.entity';
import { OrderCreatedEvent } from '../../../domain/events';
import { OrderRepository } from 'src/internal/order/infrastructure';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler
  implements ICommandHandler<CreateOrderCommand, ICreateOrderCommandResult>
{
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute({
    props,
  }: CreateOrderCommand): Promise<ICreateOrderCommandResult> {
    this.logger.log(`Creating new order for customer: ${props.customerId}`);

    this.logger.log(
      `Verifying existence of language pair: ${props.languagePairId}`,
    );
    const languagePair = await this.languagePairRepository.findById(
      props.languagePairId,
    );

    if (!languagePair) {
      this.logger.warn(`Language pair not found: ${props.languagePairId}`);
      throw new DomainException(ERRORS.LANGUAGE_PAIR.NOT_FOUND);
    }

    const order = Order.create({
      customerId: props.customerId,
      languagePairId: props.languagePairId,
      type: props.type,
    });

    const orderWithEvents = this.publisher.mergeObjectContext(order);

    orderWithEvents.apply(
      new OrderCreatedEvent({
        orderId: order.id,
        customerId: props.customerId,
        languagePairId: props.languagePairId,
        sourceContent: props.sourceContent,
        type: props.type,
        createdAt: new Date(),
      }),
    );

    await this.orderRepository.save(order);

    orderWithEvents.commit();

    this.logger.log(`Order created successfully with ID: ${order.id}`);
    return { id: order.id };
  }
}
