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

  constructor(properties: ITranslationTask) {
    super();
    Object.assign(this, properties);
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
      currentStage: args.currentStage ?? TranslationStage.READY_FOR_PROCESSING,
      status: args.status ?? TranslationTaskStatus.CREATED,
      orderId: args.orderId,
      languagePairId: args.languagePairId,
      type: args.taskType,
      wordCount: args.wordCount ?? 0,
      estimatedDurationSecs: args.estimatedDurationSecs ?? null,
      editorAssignedAt: null,
      editorCompletedAt: null,
      editorId: args.editorId,
      assignedAt: args.assignedAt,
      completedAt: args.completedAt,
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
    this.status = TranslationTaskStatus.REJECTED;
    this.rejectionReason = reason;
    this.updatedAt = new Date();

    this.apply(new TaskRejectedEvent(this.id, previousStatus, reason));
  }

  public markAsParsingError(errorMessage: string): void {
    this.logger.log(
      `Marking task ${this.id} as PARSING_ERROR. Error: ${errorMessage}`,
    );

    const previousStatus = this.status;
    this.status = TranslationTaskStatus.PARSING_ERROR;
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
      `Marking task ${this.id} as PARSED. Word count: ${wordCount}`,
    );

    if (wordCount !== undefined) {
      this.wordCount = wordCount;
    }

    if (estimatedDurationSecs !== undefined) {
      this.estimatedDurationSecs = estimatedDurationSecs;
    }

    const previousStatus = this.status;
    this.status = TranslationTaskStatus.PARSED;
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
