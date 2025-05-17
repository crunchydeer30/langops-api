import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import {
  TranslationStage,
  TranslationTaskStatus,
  TranslationTaskType,
} from '@prisma/client';
import { TaskRejectedEvent } from '../events/task-rejected.event';
import { TaskParsingErrorEvent } from '../events/task-parsing-error.event';
import { TaskParsingCompletedEvent } from '../events/task-parsing-completed.event';

export interface ITranslationTask {
  id: string;
  sourceContent: string;
  templatedContent?: string | null;
  currentStage: TranslationStage;
  status: TranslationTaskStatus;
  orderId: string;
  languagePairId: string;
  editorId?: string | null;
  type: TranslationTaskType;

  wordCount: number;
  estimatedDurationSecs?: number | null;

  editorAssignedAt?: Date | null;
  editorCompletedAt?: Date | null;
  assignedAt?: Date | null;
  completedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;

  rejectionReason?: string | null;
  errorMessage?: string | null;
}

export interface ITranslationTaskCreateArgs {
  id?: string;
  sourceContent: string;
  templatedContent?: string | null;
  orderId: string;
  languagePairId: string;
  currentStage?: TranslationStage;
  status?: TranslationTaskStatus;
  taskType: TranslationTaskType;
  editorId?: string | null;

  wordCount?: number;
  estimatedDurationSecs?: number | null;

  editorAssignedAt?: Date | null;
  editorCompletedAt?: Date | null;
  assignedAt?: Date | null;
  completedAt?: Date | null;
}

export class TranslationTask extends AggregateRoot implements ITranslationTask {
  private readonly logger = new Logger(TranslationTask.name);

  public id: string;
  public sourceContent: string;
  public templatedContent?: string | null;
  public currentStage: TranslationStage;
  public status: TranslationTaskStatus;
  public orderId: string;
  public languagePairId: string;
  public editorId?: string | null;
  public type: TranslationTaskType;

  public wordCount: number;
  public estimatedDurationSecs?: number | null;

  public editorAssignedAt?: Date | null;
  public editorCompletedAt?: Date | null;
  public assignedAt?: Date | null;
  public completedAt?: Date | null;

  public createdAt: Date;
  public updatedAt: Date;

  public rejectionReason?: string | null;
  public errorMessage?: string | null;

  constructor(properties: ITranslationTask) {
    super();
    this.id = properties.id;
    this.sourceContent = properties.sourceContent;
    this.templatedContent = properties.templatedContent;
    this.currentStage = properties.currentStage;
    this.status = properties.status;
    this.orderId = properties.orderId;
    this.languagePairId = properties.languagePairId;
    this.type = properties.type;
    this.wordCount = properties.wordCount;
    this.estimatedDurationSecs = properties.estimatedDurationSecs;
    this.editorAssignedAt = properties.editorAssignedAt;
    this.editorCompletedAt = properties.editorCompletedAt;
    this.assignedAt = properties.assignedAt;
    this.completedAt = properties.completedAt;
    this.rejectionReason = properties.rejectionReason;
    this.errorMessage = properties.errorMessage;
    this.createdAt = properties.createdAt;
    this.updatedAt = properties.updatedAt;
  }

  public static reconstitute(properties: ITranslationTask): TranslationTask {
    return new TranslationTask(properties);
  }

  public static create(args: ITranslationTaskCreateArgs): TranslationTask {
    const id = args.id || uuidv4();
    const now = new Date();

    const taskProps: ITranslationTask = {
      id,
      sourceContent: args.sourceContent,
      templatedContent: args.templatedContent,
      currentStage:
        args.currentStage ?? (TranslationStage.CREATED as TranslationStage),
      status:
        args.status ?? (TranslationTaskStatus.PENDING as TranslationTaskStatus),
      orderId: args.orderId,
      languagePairId: args.languagePairId,
      type: args.taskType,
      wordCount: args.wordCount ?? 0,
      estimatedDurationSecs: args.estimatedDurationSecs ?? null,
      editorAssignedAt: args.editorAssignedAt ?? null,
      editorCompletedAt: args.editorCompletedAt ?? null,
      editorId: args.editorId,
      assignedAt: args.assignedAt ?? null,
      completedAt: args.completedAt ?? null,
      createdAt: now,
      updatedAt: now,
      rejectionReason: null,
    };

    const task = new TranslationTask(taskProps);
    return task;
  }

  public markAsRejected(reason: string): void {
    this.logger.log(`Marking task ${this.id} as REJECTED. Reason: ${reason}`);

    const previousStatus = this.status;
    this.status = TranslationTaskStatus.REJECTED as TranslationTaskStatus;
    this.currentStage = TranslationStage.REJECTED as TranslationStage;
    this.rejectionReason = reason;
    this.updatedAt = new Date();

    this.apply(new TaskRejectedEvent(this.id, previousStatus, reason));
  }

  public markAsParsingError(errorMessage: string): void {
    this.logger.log(
      `Marking task ${this.id} as ERROR with PROCESSING_ERROR stage. Error: ${errorMessage}`,
    );

    const previousStatus = this.status;
    this.status = TranslationTaskStatus.ERROR as TranslationTaskStatus;
    this.currentStage = TranslationStage.PROCESSING_ERROR as TranslationStage;
    this.errorMessage = errorMessage;
    this.updatedAt = new Date();

    this.apply(
      new TaskParsingErrorEvent(this.id, previousStatus, errorMessage),
    );
  }

  public markAsParsed(
    wordCount?: number,
    estimatedDurationSecs?: number,
  ): void {
    this.logger.log(
      `Marking task ${this.id} as IN_PROGRESS with PARSED stage. Word count: ${wordCount}`,
    );

    if (wordCount !== undefined) {
      this.wordCount = wordCount;
    }

    if (estimatedDurationSecs !== undefined) {
      this.estimatedDurationSecs = estimatedDurationSecs;
    }

    const previousStatus = this.status;
    this.status = TranslationTaskStatus.IN_PROGRESS as TranslationTaskStatus;
    this.currentStage = TranslationStage.PARSED as TranslationStage;
    this.updatedAt = new Date();

    this.apply(
      new TaskParsingCompletedEvent(
        this.id,
        previousStatus,
        this.wordCount,
        this.estimatedDurationSecs || null,
      ),
    );
  }
}
