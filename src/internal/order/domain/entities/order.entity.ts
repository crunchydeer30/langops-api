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
  clientId: string;
  languagePairId: string;
  editorId?: string | null;
  seniorEditorId?: string | null;
  originalText: string;
  aiTranslatedText?: string | null;
  humanEditedText?: string | null;
  finalApprovedText?: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderCreateArgs {
  clientId: string;
  languagePairId: string;
  originalText: string;
}

export class Order extends AggregateRoot {
  private readonly logger = new Logger(Order.name);

  public readonly id: string;
  public readonly clientId: string;
  public readonly languagePairId: string;
  public editorId: string | null;
  public seniorEditorId: string | null;
  public originalText: string;
  public aiTranslatedText: string | null;
  public humanEditedText: string | null;
  public finalApprovedText: string | null;
  public status: OrderStatus;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: IOrder) {
    super();
    this.id = props.id;
    this.clientId = props.clientId;
    this.languagePairId = props.languagePairId;
    this.editorId = props.editorId || null;
    this.seniorEditorId = props.seniorEditorId || null;
    this.originalText = props.originalText;
    this.aiTranslatedText = props.aiTranslatedText || null;
    this.humanEditedText = props.humanEditedText || null;
    this.finalApprovedText = props.finalApprovedText || null;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // Factory method
  public static create(
    props: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>,
  ): Order {
    const now = new Date();
    const orderId = uuidv4();

    const order = new Order({
      id: orderId,
      clientId: props.clientId,
      languagePairId: props.languagePairId,
      editorId: props.editorId || null,
      seniorEditorId: props.seniorEditorId || null,
      originalText: props.originalText,
      aiTranslatedText: props.aiTranslatedText || null,
      humanEditedText: props.humanEditedText || null,
      finalApprovedText: props.finalApprovedText || null,
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });

    order.apply(
      new OrderCreatedEvent({
        orderId,
        clientId: props.clientId,
        languagePairId: props.languagePairId,
        originalText: props.originalText,
        createdAt: now,
      }),
    );

    return order;
  }

  // Methods for state transitions
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
    this.aiTranslatedText = aiTranslatedText;
    this.status = OrderStatus.PENDING_EDITOR_ASSIGNMENT;
    this.updatedAt = new Date();

    // Apply events
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

  public submitHumanEditedTranslation(humanEditedText: string): void {
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
    this.humanEditedText = humanEditedText;
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

  public approveFinalTranslation(finalApprovedText: string): void {
    this.logger.log(`Approving final translation for order: ${this.id}`);

    if (this.status !== OrderStatus.PENDING_SENIOR_REVIEW) {
      this.logger.warn(
        `Cannot approve final translation for order ${this.id} in status ${this.status}`,
      );
      throw new DomainException(ERRORS.ORDER.INVALID_STATUS_TRANSITION);
    }

    const previousStatus = this.status;
    this.finalApprovedText = finalApprovedText;
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
