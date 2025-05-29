import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { EvaluationTaskGradedEvent } from '../events';

export interface IEvaluationTask {
  id: string;
  order: number;
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
      order: args.order,
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

  public grade(score: number, feedback?: string): void {
    if (score < 1 || score > 5) {
      throw new DomainException(
        ERRORS.EVALUATION.INVALID_GRADE,
        'Rating must be between 1 and 5',
      );
    }

    this.rating = score;
    this.seniorEditorFeedback = feedback || null;
    this.updatedAt = new Date();

    this.apply(
      new EvaluationTaskGradedEvent({
        taskId: this.id,
        evaluationSetId: this.evaluationSetId,
        rating: score,
        feedback: feedback || null,
      }),
    );

    this.logger.log(`Evaluation task ${this.id} graded with score ${score}`);
  }
}
