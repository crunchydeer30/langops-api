import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  TranslationStage,
  TranslationTaskStatus,
  TranslationTaskType,
} from '@prisma/client';

export interface ITranslationTask {
  id: string;
  sourceContent: string;
  templatedContent?: string | null;
  currentStage: TranslationStage;
  status: TranslationTaskStatus;
  orderId: string;
  languagePairId: string;
  type: TranslationTaskType;
  editorId?: string | null;
  assignedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
  assignedAt?: Date | null;
  completedAt?: Date | null;
}

export class TranslationTask extends AggregateRoot implements ITranslationTask {
  private logger = new Logger(TranslationTask.name);

  public id: string;
  public sourceContent: string;
  public templatedContent?: string | null;
  public currentStage: TranslationStage;
  public status: TranslationTaskStatus;
  public orderId: string;
  public languagePairId: string;
  public editorId?: string | null;
  public type: TranslationTaskType;
  public assignedAt?: Date | null;
  public completedAt?: Date | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: ITranslationTask) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: ITranslationTask): TranslationTask {
    return new TranslationTask(properties);
  }

  public static create(args: ITranslationTaskCreateArgs): TranslationTask {
    const id = args.id ?? uuidv4();
    const now = new Date();
    const logger = new Logger(TranslationTask.name);

    logger.log(
      `Creating new TranslationTask with ID: ${id} for Order ID: ${args.orderId}`,
    );

    const taskProps: ITranslationTask = {
      id,
      sourceContent: args.sourceContent,
      templatedContent: args.templatedContent,
      currentStage: args.currentStage ?? TranslationStage.READY_FOR_PROCESSING,
      status: args.status ?? TranslationTaskStatus.QUEUED,
      orderId: args.orderId,
      languagePairId: args.languagePairId,
      type: args.taskType,
      editorId: args.editorId,
      assignedAt: args.assignedAt,
      completedAt: args.completedAt,
      createdAt: now,
      updatedAt: now,
    };

    const task = new TranslationTask(taskProps);
    return task;
  }
}
