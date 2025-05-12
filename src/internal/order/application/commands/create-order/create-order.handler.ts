import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  CreateOrderCommand,
  ICreateOrderCommandResult,
} from './create-order.command';
import { Order } from '../../../domain/entities/order.entity';
import { OrderRepository } from 'src/internal/order/infrastructure';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler
  implements ICommandHandler<CreateOrderCommand, ICreateOrderCommandResult>
{
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute({
    props,
  }: CreateOrderCommand): Promise<ICreateOrderCommandResult> {
    this.logger.log(`Creating new order for customer: ${props.customerId}`);

    const order = Order.create({
      customerId: props.customerId,
      languagePairId: props.languagePairId,
      originalText: props.originalText,
      taskSpecificInstructions: props.taskSpecificInstructions,
    });

    const orderWithEvents = this.publisher.mergeObjectContext(order);
    await this.orderRepository.save(order);
    orderWithEvents.commit();

    this.logger.log(`Order created successfully with ID: ${order.id}`);
    return { id: order.id };
  }
}
