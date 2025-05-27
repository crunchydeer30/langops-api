import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { TranslationStatus, TranslationTaskType } from '@prisma/client';

export interface ITranslation {
  id: string;
  customerId: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  originalContent: string;
  translatedContent?: string | null;
  format: TranslationTaskType;
  status: TranslationStatus;
  translationTaskId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITranslationCreateArgs {
  id?: string;
  customerId: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  originalContent: string;
  format: TranslationTaskType;
}

export class Translation extends AggregateRoot implements ITranslation {
  private logger = new Logger(Translation.name);

  public id: string;
  public customerId: string;
  public sourceLanguageCode: string;
  public targetLanguageCode: string;
  public originalContent: string;
  public translatedContent?: string | null;
  public format: TranslationTaskType;
  public status: TranslationStatus;
  public translationTaskId?: string | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: ITranslation) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: ITranslation): Translation {
    return new Translation(properties);
  }

  public static create(args: ITranslationCreateArgs): Translation {
    const id = args.id ?? uuidv4();
    const now = new Date();

    const translationProps: ITranslation = {
      id,
      customerId: args.customerId,
      sourceLanguageCode: args.sourceLanguageCode,
      targetLanguageCode: args.targetLanguageCode,
      originalContent: args.originalContent,
      translatedContent: null,
      format: args.format,
      status: TranslationStatus.PENDING,
      translationTaskId: null,
      createdAt: now,
      updatedAt: now,
    };

    const translation = new Translation(translationProps);
    translation.apply(new TranslationCreatedEvent(translation));
    return translation;
  }

  public assignTranslationTask(translationTaskId: string): void {
    if (this.translationTaskId) {
      throw new DomainException(ERRORS.TRANSLATION.TASK_ALREADY_ASSIGNED);
    }

    this.translationTaskId = translationTaskId;
    this.status = TranslationStatus.IN_PROGRESS;
    this.updatedAt = new Date();

    this.apply(new TranslationTaskAssignedEvent(this));
    this.logger.log(
      `Translation task ${translationTaskId} assigned to translation ${this.id}`,
    );
  }

  public markAsCompleted(translatedContent: string): void {
    if (!this.translationTaskId) {
      throw new DomainException(ERRORS.TRANSLATION.NO_TASK_ASSIGNED);
    }

    if (this.status === TranslationStatus.COMPLETED) {
      return;
    }

    this.translatedContent = translatedContent;
    this.status = TranslationStatus.COMPLETED;
    this.updatedAt = new Date();

    this.apply(new TranslationCompletedEvent(this));
    this.logger.log(`Translation ${this.id} marked as completed`);
  }

  public markAsError(errorMessage?: string): void {
    this.status = TranslationStatus.ERROR;
    this.updatedAt = new Date();

    this.apply(new TranslationErrorEvent(this, errorMessage));
    this.logger.log(`Translation ${this.id} marked as error: ${errorMessage}`);
  }

  public markAsCanceled(): void {
    if (this.status === TranslationStatus.COMPLETED) {
      throw new DomainException(ERRORS.TRANSLATION.CANNOT_CANCEL_COMPLETED);
    }

    this.status = TranslationStatus.CANCELED;
    this.updatedAt = new Date();

    this.apply(new TranslationCanceledEvent(this));
    this.logger.log(`Translation ${this.id} canceled`);
  }
}

export class TranslationCreatedEvent {
  constructor(public readonly translation: Translation) {}
}

export class TranslationTaskAssignedEvent {
  constructor(public readonly translation: Translation) {}
}

export class TranslationCompletedEvent {
  constructor(public readonly translation: Translation) {}
}

export class TranslationErrorEvent {
  constructor(
    public readonly translation: Translation,
    public readonly errorMessage?: string,
  ) {}
}

export class TranslationCanceledEvent {
  constructor(public readonly translation: Translation) {}
}
