import { Injectable } from '@nestjs/common';
import { Prisma, EvaluationTask as EvaluationTaskModel } from '@prisma/client';
import {
  EvaluationTask,
  IEvaluationTask,
} from '../../domain/entities/evaluation-task.entity';

@Injectable()
export class EvaluationTaskMapper {
  toDomain(model: EvaluationTaskModel): EvaluationTask {
    const taskProps: IEvaluationTask = {
      id: model.id,
      rating: model.rating,
      seniorEditorFeedback: model.seniorEditorFeedback,
      evaluationSetId: model.evaluationSetId,
      translationTaskId: model.translationTaskId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return EvaluationTask.reconstitute(taskProps);
  }

  toPersistenceForUpdate(
    task: EvaluationTask,
  ): Prisma.EvaluationTaskUpdateInput {
    const { rating, seniorEditorFeedback, evaluationSetId, translationTaskId } =
      task;

    return {
      rating,
      seniorEditorFeedback,
      evaluationSet: { connect: { id: evaluationSetId } },
      ...(translationTaskId && {
        translationTask: { connect: { id: translationTaskId } },
      }),
    };
  }

  toPersistenceForCreate(
    task: EvaluationTask,
  ): Prisma.EvaluationTaskCreateInput {
    const {
      id,
      rating,
      seniorEditorFeedback,
      evaluationSetId,
      translationTaskId,
    } = task;

    return {
      id,
      rating,
      seniorEditorFeedback,
      evaluationSet: { connect: { id: evaluationSetId } },
      ...(translationTaskId && {
        translationTask: { connect: { id: translationTaskId } },
      }),
    };
  }
}
