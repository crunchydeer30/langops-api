import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { EvaluationTaskRatedEvent } from '../events';

export interface IEvaluationTask {
  id: string;
  rating?: number | null;
  seniorEditorFeedback?: string | null;
  evaluationSetId: string;
  translationTaskId?: string | null;
  editedContent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvaluationTaskCreateArgs {
  id?: string;
  order: number;
  evaluationSetId: string;
  translationTaskId?: string | null;
}

export class EvaluationTask extends AggregateRoot implements IEvaluationTask {
  private readonly logger = new Logger(EvaluationTask.name);

  public id: string;
  public order: number;
  public rating?: number | null;
  public seniorEditorFeedback?: string | null;
  public evaluationSetId: string;
  public translationTaskId?: string | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: IEvaluationTask) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: IEvaluationTask): EvaluationTask {
    return new EvaluationTask(properties);
  }

  public static create(args: IEvaluationTaskCreateArgs): EvaluationTask {
    const id = args.id || uuidv4();
    const now = new Date();

    const task = new EvaluationTask({
      id,
      rating: null,
      seniorEditorFeedback: null,
      evaluationSetId: args.evaluationSetId,
      translationTaskId: args.translationTaskId || null,
      editedContent: null,
      createdAt: now,
      updatedAt: now,
    });

    return task;
  }

  public rate(score: number, feedback: string): void {
    if (score < 1 || score > 5) {
      throw new DomainException(
        ERRORS.EVALUATION.INVALID_RATING,
        'Rating must be between 1 and 5',
      );
    }

    if (!feedback || feedback.trim() === '') {
      throw new DomainException(ERRORS.EVALUATION.INVALID_FEEDBACK);
    }

    this.rating = score;
    this.seniorEditorFeedback = feedback;
    this.updatedAt = new Date();

    this.apply(
      new EvaluationTaskRatedEvent({
        evaluationTaskId: this.id,
        evaluationSetId: this.evaluationSetId,
        rating: score,
        seniorEditorFeedback: feedback,
      }),
    );

    this.logger.log(`Evaluation task ${this.id} rated with score ${score}`);
  }
}
