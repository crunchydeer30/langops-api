import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderStatus, OrderType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';
import { OrderStatusChangedEvent } from '../events';

export interface IOrder {
  id: string;
  customerId: string;
  languagePairId: string;
  status: OrderStatus;
  type: OrderType;
  totalPrice?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderCreateArgs {
  customerId: string;
  languagePairId: string;
  type: OrderType;
}

export class Order extends AggregateRoot {
  private readonly logger = new Logger(Order.name);

  public id: string;
  public customerId: string;
  public languagePairId: string;
  public status: OrderStatus;
  public type: OrderType;
  public totalPrice?: number | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: IOrder) {
    super();
    this.id = props.id;
    this.customerId = props.customerId;
    this.languagePairId = props.languagePairId;
    this.status = props.status;
    this.type = props.type;
    this.totalPrice = props.totalPrice;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(args: IOrderCreateArgs): Order {
    const now = new Date();
    const orderId = uuidv4();

    const orderProps: IOrder = {
      id: orderId,
      customerId: args.customerId,
      languagePairId: args.languagePairId,
      type: args.type,
      status: OrderStatus.PENDING as OrderStatus,
      totalPrice: null,
      createdAt: now,
      updatedAt: now,
    };

    const order = new Order(orderProps);

    return order;
  }

  public startProgress(): void {
    this.logger.log(`Starting progress for order: ${this.id}`);
    if (this.status !== OrderStatus.PENDING) {
      this.logger.warn(
        `Cannot start progress for order ${this.id} in status ${this.status}`,
      );
      throw new DomainException(ERRORS.ORDER.INVALID_STATUS_TRANSITION);
    }
    const previousStatus = this.status;
    this.status = OrderStatus.IN_PROGRESS as OrderStatus;
    this.updatedAt = new Date();
    this.apply(
      new OrderStatusChangedEvent({
        orderId: this.id,
        previousStatus,
        newStatus: this.status,
        changedAt: this.updatedAt,
      }),
    );
  }

  public completeOrder(): void {
    this.logger.log(`Completing order: ${this.id}`);
    if (this.status !== OrderStatus.IN_PROGRESS) {
      this.logger.warn(
        `Cannot complete order ${this.id} in status ${this.status}`,
      );
      throw new DomainException(ERRORS.ORDER.INVALID_STATUS_TRANSITION);
    }
    const previousStatus = this.status;
    this.status = OrderStatus.COMPLETED as OrderStatus;
    this.updatedAt = new Date();
    this.apply(
      new OrderStatusChangedEvent({
        orderId: this.id,
        previousStatus,
        newStatus: this.status,
        changedAt: this.updatedAt,
      }),
    );
  }

  public failOrder(): void {
    this.logger.log(`Failing order: ${this.id}`);
    const previousStatus = this.status;

    this.status = OrderStatus.CANCELLED as OrderStatus;
    this.updatedAt = new Date();
    this.apply(
      new OrderStatusChangedEvent({
        orderId: this.id,
        previousStatus,
        newStatus: this.status,
        changedAt: this.updatedAt,
      }),
    );
  }

  public cancelOrder(): void {
    this.logger.log(`Cancelling order: ${this.id}`);
    if (this.status === OrderStatus.COMPLETED) {
      this.logger.warn(
        `Cannot cancel order ${this.id} in status ${this.status}`,
      );
      throw new DomainException(ERRORS.ORDER.INVALID_STATUS_TRANSITION);
    }
    const previousStatus = this.status;
    this.status = OrderStatus.CANCELLED as OrderStatus;
    this.updatedAt = new Date();
    this.apply(
      new OrderStatusChangedEvent({
        orderId: this.id,
        previousStatus,
        newStatus: this.status,
        changedAt: this.updatedAt,
      }),
    );
  }
}
