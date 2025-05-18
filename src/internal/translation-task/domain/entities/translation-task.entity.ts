import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  TranslationStage,
  TranslationTaskStatus,
  TranslationTaskType,
} from '@prisma/client';
import {
  TaskCompletedEvent,
  TaskEditingStartedEvent,
  TaskMachineTranslationStartedEvent,
  TaskProcessingCompletedEvent,
  TaskParsingErrorEvent,
  TaskProcessingStartedEvent,
  TaskQueuedForEditingEvent,
  TaskRejectedEvent,
} from '../events';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';

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
    Object.assign(this, properties);
  }

  public static reconstitute(properties: ITranslationTask): TranslationTask {
    return new TranslationTask(properties);
  }

  public static create(args: ITranslationTaskCreateArgs): TranslationTask {
    const id = args.id || uuidv4();
    const now = new Date();

    const task = new TranslationTask({
      id,
      sourceContent: args.sourceContent,
      templatedContent: args.templatedContent ?? null,
      currentStage: args.currentStage ?? TranslationStage.QUEUED_FOR_PROCESSING,
      status: args.status ?? TranslationTaskStatus.PENDING,
      orderId: args.orderId,
      languagePairId: args.languagePairId,
      type: args.taskType,
      wordCount: args.wordCount ?? 0,
      estimatedDurationSecs: args.estimatedDurationSecs ?? null,
      editorAssignedAt: args.editorAssignedAt ?? null,
      editorCompletedAt: args.editorCompletedAt ?? null,
      editorId: args.editorId ?? null,
      assignedAt: args.assignedAt ?? null,
      completedAt: args.completedAt ?? null,
      createdAt: now,
      updatedAt: now,
      rejectionReason: null,
      errorMessage: null,
    });

    task.apply(
      new TaskQueuedForEditingEvent({
        taskId: id,
        previousStatus: TranslationTaskStatus.PENDING,
        previousStage: TranslationStage.QUEUED_FOR_PROCESSING,
      }),
    );
    return task;
  }

  private ensureStage(expected: TranslationStage, action: string) {
    if (this.currentStage !== expected) {
      throw new DomainException(
        ERRORS.COMMON.INVALID_STATE,
        `Cannot ${action}: expected stage ${expected} but is ${this.currentStage}`,
      );
    }
  }

  private ensureStatus(expected: TranslationTaskStatus, action: string) {
    if (this.status !== expected) {
      const logger = new Logger(TranslationTask.name);
      logger.error(
        `Cannot ${action}: expected status ${expected} but is ${this.status}`,
      );
      throw new DomainException(
        ERRORS.COMMON.INVALID_STATE,
        `Cannot ${action}: expected status ${expected} but is ${this.status}`,
      );
    }
  }

  public startProcessing(): void {
    this.ensureStage(
      TranslationStage.QUEUED_FOR_PROCESSING,
      'start processing',
    );
    this.ensureStatus(TranslationTaskStatus.PENDING, 'start processing');

    this.status = TranslationTaskStatus.IN_PROGRESS;
    this.currentStage = TranslationStage.PROCESSING;

    this.apply(
      new TaskProcessingStartedEvent({
        taskId: this.id,
        previousStatus: TranslationTaskStatus.PENDING,
        previousStage: TranslationStage.QUEUED_FOR_PROCESSING,
      }),
    );
  }

  public completeProcessing(): void {
    this.ensureStage(TranslationStage.PROCESSING, 'mark processing complete');
    this.ensureStatus(
      TranslationTaskStatus.IN_PROGRESS,
      'mark processing complete',
    );

    this.currentStage = TranslationStage.QUEUED_FOR_MT;
    this.status = TranslationTaskStatus.PENDING;

    this.apply(
      new TaskProcessingCompletedEvent({
        taskId: this.id,
        previousStatus: TranslationTaskStatus.IN_PROGRESS,
        wordCount: this.wordCount,
        estimatedDurationSecs: this.estimatedDurationSecs ?? 0,
      }),
    );
  }

  public startMachineTranslation(): void {
    this.ensureStage(
      TranslationStage.QUEUED_FOR_MT,
      'start machine translation',
    );
    this.ensureStatus(
      TranslationTaskStatus.PENDING,
      'start machine translation',
    );

    this.status = TranslationTaskStatus.IN_PROGRESS;
    this.currentStage = TranslationStage.MACHINE_TRANSLATING;

    this.apply(
      new TaskMachineTranslationStartedEvent({
        taskId: this.id,
        previousStatus: TranslationTaskStatus.PENDING,
        previousStage: TranslationStage.QUEUED_FOR_MT,
      }),
    );
  }

  public completeMachineTranslation(): void {
    this.ensureStage(
      TranslationStage.MACHINE_TRANSLATING,
      'mark machine translation complete',
    );

    this.currentStage = TranslationStage.QUEUED_FOR_EDITING;
    this.status = TranslationTaskStatus.PENDING;

    this.apply(
      new TaskQueuedForEditingEvent({
        taskId: this.id,
        previousStatus: TranslationTaskStatus.IN_PROGRESS,
        previousStage: TranslationStage.MACHINE_TRANSLATING,
      }),
    );
  }

  public startEditing(editorId: string): void {
    this.ensureStage(TranslationStage.QUEUED_FOR_EDITING, 'start editing');
    this.ensureStatus(TranslationTaskStatus.PENDING, 'start editing');

    this.editorId = editorId;
    this.assignedAt = new Date();
    this.editorAssignedAt = new Date();
    this.status = TranslationTaskStatus.IN_PROGRESS;
    this.currentStage = TranslationStage.EDITING;

    this.apply(
      new TaskEditingStartedEvent({
        taskId: this.id,
        editorId,
        previousStatus: TranslationTaskStatus.PENDING,
        previousStage: TranslationStage.QUEUED_FOR_EDITING,
      }),
    );
  }

  public completeTask(): void {
    this.ensureStage(TranslationStage.EDITING, 'complete task');
    this.ensureStatus(TranslationTaskStatus.IN_PROGRESS, 'complete task');

    this.status = TranslationTaskStatus.COMPLETED;
    this.currentStage = TranslationStage.COMPLETED;
    this.completedAt = new Date();
    this.editorCompletedAt = new Date();

    this.apply(
      new TaskCompletedEvent({
        taskId: this.id,
        editorId: this.editorId!,
        previousStatus: TranslationTaskStatus.IN_PROGRESS,
        previousStage: TranslationStage.EDITING,
      }),
    );
  }

  public rejectTask(reason: string): void {
    this.ensureStatus(TranslationTaskStatus.IN_PROGRESS, 'reject task');

    this.status = TranslationTaskStatus.REJECTED;
    this.currentStage = TranslationStage.COMPLETED;
    this.rejectionReason = reason;

    this.apply(
      new TaskRejectedEvent({
        taskId: this.id,
        rejectionReason: reason,
        previousStatus: TranslationTaskStatus.IN_PROGRESS,
      }),
    );
  }

  public handleProcessingError(errorMessage: string): void {
    this.status = TranslationTaskStatus.ERROR;
    this.errorMessage = errorMessage;

    this.apply(
      new TaskParsingErrorEvent({
        taskId: this.id,
        errorMessage,
        previousStatus: TranslationTaskStatus.IN_PROGRESS,
      }),
    );
  }
}
