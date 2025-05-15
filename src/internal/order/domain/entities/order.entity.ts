import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';
import {
  OrderCreatedEvent,
  OrderAITranslatedEvent,
  OrderStatusChangedEvent,
} from '../events';

export interface IOrder {
  id: string;
  customerId: string;
  languagePairId: string;
  editorId?: string | null;
  seniorEditorId?: string | null;
  originalText: string;
  maskedText?: string | null;
  taskSpecificInstructions?: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderCreateArgs {
  customerId: string;
  languagePairId: string;
  originalText: string;
  taskSpecificInstructions?: string | null;
  editorId?: string | null;
  seniorEditorId?: string | null;
}

export class Order extends AggregateRoot {
  private readonly logger = new Logger(Order.name);

  public readonly id: string;
  public readonly customerId: string;
  public readonly languagePairId: string;
  public editorId: string | null;
  public seniorEditorId: string | null;
  public originalText: string;
  public maskedText: string | null;
  public taskSpecificInstructions: string | null;
  public status: OrderStatus;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: IOrder) {
    super();
    this.id = props.id;
    this.customerId = props.customerId;
    this.languagePairId = props.languagePairId;
    this.editorId = props.editorId || null;
    this.seniorEditorId = props.seniorEditorId || null;
    this.originalText = props.originalText;
    this.maskedText = props.maskedText ?? null;
    this.taskSpecificInstructions = props.taskSpecificInstructions || null;
    this.status = props.status;
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
      editorId: props.editorId || null,
      seniorEditorId: props.seniorEditorId || null,
      originalText: props.originalText,
      maskedText: null,
      taskSpecificInstructions: props.taskSpecificInstructions || null,
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });

    order.apply(
      new OrderCreatedEvent({
        orderId,
        customerId: props.customerId,
        languagePairId: props.languagePairId,
        originalText: props.originalText,
        taskSpecificInstructions: props.taskSpecificInstructions || null,
        createdAt: now,
      }),
    );

    return order;
  }

  public setAITranslation(aiTranslatedText: string): void {
    this.logger.log(`Setting AI translation for order: ${this.id}`);

    if (
      this.status !== OrderStatus.PENDING &&
      this.status !== OrderStatus.PENDING_AI
    ) {
      this.logger.warn(
        `Cannot set AI translation for order ${this.id} in status ${this.status}`,
      );
      throw new DomainException(ERRORS.ORDER.INVALID_STATUS_TRANSITION);
    }

    const previousStatus = this.status;
    this.status = OrderStatus.PENDING_EDITOR_ASSIGNMENT;
    this.updatedAt = new Date();

    this.apply(
      new OrderAITranslatedEvent({
        orderId: this.id,
        aiTranslatedText,
        translatedAt: this.updatedAt,
      }),
    );

    this.apply(
      new OrderStatusChangedEvent({
        orderId: this.id,
        previousStatus,
        newStatus: this.status,
        changedAt: this.updatedAt,
      }),
    );
  }

  public assignEditor(editorId: string): void {
    this.logger.log(`Assigning editor ${editorId} to order: ${this.id}`);

    if (this.status !== OrderStatus.PENDING_EDITOR_ASSIGNMENT) {
      this.logger.warn(
        `Cannot assign editor for order ${this.id} in status ${this.status}`,
      );
      throw new DomainException(ERRORS.ORDER.INVALID_STATUS_TRANSITION);
    }

    const previousStatus = this.status;
    this.editorId = editorId;
    this.status = OrderStatus.IN_EDITING;
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

  public submitHumanEditedTranslation(): void {
    this.logger.log(
      `Submitting human edited translation for order: ${this.id}`,
    );

    if (this.status !== OrderStatus.IN_EDITING) {
      this.logger.warn(
        `Cannot submit human edited translation for order ${this.id} in status ${this.status}`,
      );
      throw new DomainException(ERRORS.ORDER.INVALID_STATUS_TRANSITION);
    }

    if (!this.editorId) {
      this.logger.warn(`No editor assigned to order ${this.id}`);
      throw new DomainException(ERRORS.ORDER.NO_EDITOR_ASSIGNED);
    }

    const previousStatus = this.status;
    this.status = OrderStatus.PENDING_SENIOR_REVIEW;
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

  public approveFinalTranslation(): void {
    this.logger.log(`Approving final translation for order: ${this.id}`);

    if (this.status !== OrderStatus.PENDING_SENIOR_REVIEW) {
      this.logger.warn(
        `Cannot approve final translation for order ${this.id} in status ${this.status}`,
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
}
