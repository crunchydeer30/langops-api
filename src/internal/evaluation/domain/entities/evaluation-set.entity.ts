import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { EvaluationSetStatus, EvaluationType } from '@prisma/client';
import {
  EvaluationSetCreatedEvent,
  EvaluationSetCompletedEvent,
  EvaluationSetStatusChangedEvent,
  EvaluationSetReviewerAssignedEvent,
} from '../events';

export interface IEvaluationSet {
  id: string;
  type: EvaluationType;
  status: EvaluationSetStatus;
  editorId: string;
  languagePairId: string;
  evaluatorId?: string | null;
  editorLanguagePairId?: string | null;
  averageRating?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvaluationSetCreateArgs {
  id?: string;
  type: EvaluationType;
  editorId: string;
  languagePairId: string;
  editorLanguagePairId?: string | null;
  evaluatorId?: string | null;
}

export class EvaluationSet extends AggregateRoot implements IEvaluationSet {
  private readonly logger = new Logger(EvaluationSet.name);

  public id: string;
  public type: EvaluationType;
  public status: EvaluationSetStatus;
  public editorId: string;
  public languagePairId: string;
  public evaluatorId?: string | null;
  public editorLanguagePairId?: string | null;
  public averageRating?: number | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: IEvaluationSet) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: IEvaluationSet): EvaluationSet {
    return new EvaluationSet(properties);
  }

  public static create(args: IEvaluationSetCreateArgs): EvaluationSet {
    const id = args.id || uuidv4();
    const now = new Date();

    const evaluationSet = new EvaluationSet({
      id,
      type: args.type,
      status: EvaluationSetStatus.IN_PROGRESS,
      editorId: args.editorId,
      languagePairId: args.languagePairId,
      evaluatorId: args.evaluatorId || null,
      editorLanguagePairId: args.editorLanguagePairId || null,
      averageRating: null,
      createdAt: now,
      updatedAt: now,
    });

    evaluationSet.apply(
      new EvaluationSetCreatedEvent({
        evaluationSetId: evaluationSet.id,
        editorId: evaluationSet.editorId,
        languagePairId: evaluationSet.languagePairId,
        type: evaluationSet.type,
      }),
    );

    evaluationSet.logger.log(
      `Evaluation set ${evaluationSet.id} created for editor ${evaluationSet.editorId} and language pair ${evaluationSet.languagePairId}`,
    );

    return evaluationSet;
  }

  public markAsCompleted(averageRating: number): void {
    if (this.status !== EvaluationSetStatus.REVIEWING) {
      throw new DomainException(ERRORS.EVALUATION.INVALID_STATE);
    }

    if (averageRating < 1 || averageRating > 5) {
      throw new DomainException(ERRORS.EVALUATION.INVALID_RATING);
    }

    this.status = EvaluationSetStatus.COMPLETED;
    this.averageRating = averageRating;
    this.updatedAt = new Date();
    const isQualified = averageRating >= 4.5;

    this.apply(
      new EvaluationSetCompletedEvent({
        evaluationSetId: this.id,
        editorId: this.editorId,
        languagePairId: this.languagePairId,
        averageRating: this.averageRating,
        isQualified,
      }),
    );

    this.logger.log(
      `Evaluation set ${this.id} marked as completed with average rating ${this.averageRating}. Editor is ${isQualified ? 'qualified' : 'not qualified'}.`,
    );
  }

  public markAsReadyForReview(): void {
    if (this.status !== EvaluationSetStatus.IN_PROGRESS) {
      throw new DomainException(ERRORS.EVALUATION.INVALID_STATE);
    }

    this.status = EvaluationSetStatus.READY_FOR_REVIEW;
    this.updatedAt = new Date();

    this.apply(
      new EvaluationSetStatusChangedEvent({
        evaluationSetId: this.id,
        status: this.status,
      }),
    );

    this.logger.log(`Evaluation set ${this.id} marked as ready for review`);
  }

  public assignReviewer(reviewerId: string): void {
    if (this.status !== EvaluationSetStatus.READY_FOR_REVIEW) {
      throw new DomainException(ERRORS.EVALUATION.INVALID_STATE);
    }

    if (this.evaluatorId) {
      throw new DomainException(ERRORS.EVALUATION.ALREADY_ASSIGNED);
    }

    this.evaluatorId = reviewerId;
    this.status = EvaluationSetStatus.REVIEWING;
    this.updatedAt = new Date();

    this.apply(
      new EvaluationSetReviewerAssignedEvent({
        evaluationSetId: this.id,
        reviewerId: this.evaluatorId,
      }),
    );

    this.apply(
      new EvaluationSetStatusChangedEvent({
        evaluationSetId: this.id,
        status: this.status,
      }),
    );

    this.logger.log(
      `Reviewer ${reviewerId} assigned to evaluation set ${this.id}`,
    );
  }
}
