import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface ITranslationSegment {
  id: string;
  orderId?: string | null;
  evaluationTaskId?: string | null;
  sequenceNumber: number;
  originalText: string;
  containsSensitiveData: boolean;
  sensitiveDataTokens: string[];
  aiTranslatedText?: string | null;
  humanEditedText?: string | null;
  finalApprovedText?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITranslationSegmentCreateArgs {
  orderId?: string | null;
  evaluationTaskId?: string | null;
  sequenceNumber: number;
  originalText: string;
  containsSensitiveData?: boolean;
  sensitiveDataTokens?: string[];
  aiTranslatedText?: string | null;
  humanEditedText?: string | null;
  finalApprovedText?: string | null;
}

export class TranslationSegment extends AggregateRoot {
  private readonly logger = new Logger(TranslationSegment.name);

  public id: string;
  public orderId: string | null;
  public evaluationTaskId: string | null;
  public sequenceNumber: number;
  public originalText: string;
  public containsSensitiveData: boolean;
  public sensitiveDataTokens: string[];
  public aiTranslatedText: string | null;
  public humanEditedText: string | null;
  public finalApprovedText: string | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: ITranslationSegment) {
    super();
    this.id = props.id;
    this.orderId = props.orderId || null;
    this.evaluationTaskId = props.evaluationTaskId || null;
    this.sequenceNumber = props.sequenceNumber;
    this.originalText = props.originalText;
    this.containsSensitiveData = props.containsSensitiveData ?? false;
    this.sensitiveDataTokens = props.sensitiveDataTokens ?? [];
    this.aiTranslatedText = props.aiTranslatedText || null;
    this.humanEditedText = props.humanEditedText || null;
    this.finalApprovedText = props.finalApprovedText || null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    if (
      (this.orderId === null && this.evaluationTaskId === null) ||
      (this.orderId !== null && this.evaluationTaskId !== null)
    ) {
      this.logger.error(
        'A segment must belong to either an order OR an evaluation task',
      );
      throw new Error(
        'Invalid segment: Must belong to either an order OR an evaluation task',
      );
    }
  }

  public static create(
    props: ITranslationSegmentCreateArgs,
  ): TranslationSegment {
    const now = new Date();
    const segmentId = uuidv4();

    const segment = new TranslationSegment({
      id: segmentId,
      orderId: props.orderId || null,
      evaluationTaskId: props.evaluationTaskId || null,
      sequenceNumber: props.sequenceNumber,
      originalText: props.originalText,
      containsSensitiveData: props.containsSensitiveData ?? false,
      sensitiveDataTokens: props.sensitiveDataTokens ?? [],
      aiTranslatedText: props.aiTranslatedText || null,
      humanEditedText: props.humanEditedText || null,
      finalApprovedText: props.finalApprovedText || null,
      createdAt: now,
      updatedAt: now,
    });

    return segment;
  }

  public setAITranslation(aiTranslatedText: string): void {
    this.aiTranslatedText = aiTranslatedText;
    this.updatedAt = new Date();
  }

  public setHumanEditedTranslation(humanEditedText: string): void {
    this.humanEditedText = humanEditedText;
    this.updatedAt = new Date();
  }

  public setFinalApprovedTranslation(finalApprovedText: string): void {
    this.finalApprovedText = finalApprovedText;
    this.updatedAt = new Date();
  }
}
