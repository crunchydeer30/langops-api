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
  TaskParsingCompletedEvent,
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
      currentStage: args.currentStage ?? TranslationStage.QUEUED_FOR_PROCESSING,
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

  private setNextStatus(
    newStatus: TranslationTaskStatus,
  ): TranslationTaskStatus {
    const previousStatus = this.status;
    this.status = newStatus;
    return previousStatus;
  }

  private async validateEditorAssignment(): Promise<void> {
    if (!this.editorId) {
      const error = new DomainException(
        ERRORS.TRANSLATION_TASK.EDITOR_NOT_ASSIGNED,
      );
      this.logger.error(
        `Failed to start editing for task ${this.id}: ${error.message}`,
      );
      throw error;
    }
  }

  public startProcessing(): void {
    const previousStatus = this.setNextStatus(
      TranslationTaskStatus.IN_PROGRESS,
    );
    const previousStage = this.currentStage;

    this.currentStage = TranslationStage.PROCESSING;
    this.updatedAt = new Date();

    this.apply(
      new TaskProcessingStartedEvent({
        taskId: this.id,
        previousStatus,
        previousStage,
      }),
    );
  }

  public startMachineTranslation(): void {
    const previousStatus = this.status;
    const previousStage = this.currentStage;

    this.currentStage = TranslationStage.MACHINE_TRANSLATING;
    this.updatedAt = new Date();

    this.apply(
      new TaskMachineTranslationStartedEvent({
        taskId: this.id,
        previousStatus,
        previousStage,
      }),
    );
  }

  public queueForEditing(): void {
    const previousStatus = this.status;
    const previousStage = this.currentStage;

    this.status = TranslationTaskStatus.PENDING;
    this.currentStage = TranslationStage.QUEUED_FOR_EDITING;
    this.updatedAt = new Date();

    this.apply(
      new TaskQueuedForEditingEvent({
        taskId: this.id,
        previousStatus,
        previousStage,
      }),
    );
  }

  public async startEditing(): Promise<void> {
    await this.validateEditorAssignment();

    const previousStatus = this.setNextStatus(
      TranslationTaskStatus.IN_PROGRESS,
    );
    const previousStage = this.currentStage;

    this.currentStage = TranslationStage.EDITING;
    this.editorAssignedAt = new Date();
    this.updatedAt = new Date();

    this.apply(
      new TaskEditingStartedEvent({
        taskId: this.id,
        previousStatus,
        previousStage,
        editorId: this.editorId || null,
      }),
    );
  }

  public completeTask(): void {
    const previousStatus = this.setNextStatus(TranslationTaskStatus.COMPLETED);
    const previousStage = this.currentStage;

    this.currentStage = TranslationStage.COMPLETED;
    if (!this.editorId) {
      this.logger.warn(
        `Task ${this.id} completed without an editor assignment.`,
      );
    }
    this.completedAt = new Date();
    if (this.editorId) {
      this.editorCompletedAt = new Date();
    }
    this.updatedAt = new Date();

    this.apply(
      new TaskCompletedEvent({
        taskId: this.id,
        previousStatus,
        previousStage,
        editorId: this.editorId || null,
      }),
    );
  }

  public markAsRejected(reason: string): void {
    const previousStatus = this.setNextStatus(TranslationTaskStatus.REJECTED);

    this.rejectionReason = reason;
    this.updatedAt = new Date();

    this.apply(
      new TaskRejectedEvent({
        taskId: this.id,
        previousStatus,
        rejectionReason: reason,
      }),
    );
  }

  public markAsParsingError(errorMessage: string): void {
    const previousStatus = this.setNextStatus(TranslationTaskStatus.ERROR);

    this.errorMessage = errorMessage;
    this.updatedAt = new Date();

    this.apply(
      new TaskParsingErrorEvent({
        taskId: this.id,
        previousStatus,
        errorMessage,
      }),
    );
  }

  public markAsParsed(estimatedDurationSecs?: number): void {
    this.logger.log(
      `Marking task ${this.id} as PENDING with QUEUED_FOR_MT stage`,
    );

    if (estimatedDurationSecs !== undefined) {
      this.estimatedDurationSecs = estimatedDurationSecs;
    }

    const previousStatus = this.setNextStatus(TranslationTaskStatus.PENDING);
    this.currentStage = TranslationStage.QUEUED_FOR_MT;
    this.updatedAt = new Date();

    this.apply(
      new TaskParsingCompletedEvent({
        taskId: this.id,
        previousStatus,
        wordCount: this.wordCount,
        estimatedDurationSecs: this.estimatedDurationSecs || null,
      }),
    );
  }
}
