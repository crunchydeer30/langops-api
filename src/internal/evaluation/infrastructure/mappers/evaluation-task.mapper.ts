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
      order: model.order,
      rating: model.rating,
      seniorEditorFeedback: model.seniorEditorFeedback,
      evaluationSetId: model.evaluationSetId,
      translationTaskId: model.translationTaskId,
      editedContent: model.editedContent,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return EvaluationTask.reconstitute(taskProps);
  }

  toPersistenceForUpdate(
    task: EvaluationTask,
  ): Prisma.EvaluationTaskUpdateInput {
    const {
      order,
      rating,
      seniorEditorFeedback,
      evaluationSetId,
      translationTaskId,
      editedContent,
    } = task;

    return {
      order,
      rating,
      seniorEditorFeedback,
      editedContent,
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
      order,
      rating,
      seniorEditorFeedback,
      evaluationSetId,
      translationTaskId,
      editedContent,
    } = task;

    return {
      id,
      order,
      rating,
      seniorEditorFeedback,
      editedContent,
      evaluationSet: { connect: { id: evaluationSetId } },
      ...(translationTaskId && {
        translationTask: { connect: { id: translationTaskId } },
      }),
    };
  }
}
