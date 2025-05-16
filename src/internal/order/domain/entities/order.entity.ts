import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderStatus, TranslationStage, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';
import {
  OrderCreatedEvent,
  OrderStageChangedEvent,
  OrderStatusChangedEvent,
} from '../events';

export interface IOrder {
  id: string;
  customerId: string;
  languagePairId: string;
  originalText: string;
  status: OrderStatus;
  totalPrice?: number | null;
  currentStage?: TranslationStage | null;
  sensitiveDataMaskedText?: string | null;
  parsedTextSegments?: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderCreateArgs {
  customerId: string;
  languagePairId: string;
  originalText: string;
}

export class Order extends AggregateRoot {
  private readonly logger = new Logger(Order.name);

  public id: string;
  public customerId: string;
  public languagePairId: string;
  public originalText: string;
  public status: OrderStatus;
  public currentStage?: TranslationStage | null;
  public sensitiveDataMaskedText?: string | null;
  public parsedTextSegments?: Prisma.JsonValue | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: IOrder) {
    super();
    this.id = props.id;
    this.customerId = props.customerId;
    this.languagePairId = props.languagePairId;
    this.originalText = props.originalText;
    this.status = props.status;
    this.currentStage = props.currentStage;
    this.sensitiveDataMaskedText = props.sensitiveDataMaskedText;
    this.parsedTextSegments = props.parsedTextSegments;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: IOrderCreateArgs): Order {
    const now = new Date();
    const orderId = uuidv4();

    const order = new Order({
      id: orderId,
      customerId: props.customerId,
      languagePairId: props.languagePairId,
      originalText: props.originalText,
      status: OrderStatus.PENDING_SUBMISSION,
      totalPrice: null,
      currentStage: TranslationStage.READY_FOR_PROCESSING,
      sensitiveDataMaskedText: null,
      parsedTextSegments: null,
      createdAt: now,
      updatedAt: now,
    });

    order.apply(
      new OrderCreatedEvent({
        orderId,
        customerId: props.customerId,
        languagePairId: props.languagePairId,
        originalText: props.originalText,
        createdAt: now,
      }),
    );

    return order;
  }

  public startProgress(): void {
    this.logger.log(`Starting progress for order: ${this.id}`);
    if (this.status !== OrderStatus.PENDING_SUBMISSION) {
      this.logger.warn(
        `Cannot start progress for order ${this.id} in status ${this.status}`,
      );
      throw new DomainException(ERRORS.ORDER.INVALID_STATUS_TRANSITION);
    }
    const previousStatus = this.status;
    this.status = OrderStatus.IN_PROGRESS;
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
    this.status = OrderStatus.COMPLETED;
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
    this.status = OrderStatus.FAILED;
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
    if (
      this.status === OrderStatus.COMPLETED ||
      this.status === OrderStatus.FAILED
    ) {
      this.logger.warn(
        `Cannot cancel order ${this.id} in status ${this.status}`,
      );
      throw new DomainException(ERRORS.ORDER.INVALID_STATUS_TRANSITION);
    }
    const previousStatus = this.status;
    this.status = OrderStatus.CANCELLED;
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

  public updateStage(newStage: TranslationStage): void {
    this.logger.log(
      `Updating stage for order ${this.id} from ${this.currentStage} to ${newStage}`,
    );
    const previousStage = this.currentStage;
    this.currentStage = newStage;
    this.updatedAt = new Date();
    this.apply(
      new OrderStageChangedEvent({
        orderId: this.id,
        previousStage,
        newStage: this.currentStage,
        changedAt: this.updatedAt,
      }),
    );
  }

  // Method to set the sensitive data masked text
  public setSensitiveDataMaskedText(text: string): void {
    this.logger.log(`Setting sensitive data masked text for order ${this.id}`);
    this.sensitiveDataMaskedText = text;
    this.updatedAt = new Date();
  }

  public setParsedTextSegments(segments: Prisma.JsonValue): void {
    this.logger.log(`Setting parsed text segments for order ${this.id}`);
    this.parsedTextSegments = segments;
    this.updatedAt = new Date();
  }

  public getId(): string {
    return this.id;
  }
}
