import {
  Prisma,
  TranslationTask as TranslationTaskModel,
} from '@prisma/client';
import {
  TranslationTask,
  ITranslationTask,
} from '../../domain/entities/translation-task.entity';
import { Injectable } from '@nestjs/common';
import { OriginalStructure } from 'src/internal/translation-task-processing/domain/interfaces/original-structure.interface';

@Injectable()
export class TranslationTaskMapper {
  toDomain(model: TranslationTaskModel): TranslationTask {
    const taskProps: ITranslationTask = {
      id: model.id,
      originalContent: model.originalContent,
      type: model.formatType,
      originalStructure: model.originalStructure || null,
      currentStage: model.currentStage,
      status: model.status,
      languagePairId: model.languagePairId,
      editorId: model.editorId,
      assignedAt: model.assignedAt,
      completedAt: model.completedAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      isEvaluationTask: model.isEvaluationTask,
    };

    return TranslationTask.reconstitute(taskProps);
  }

  toPersistenceForUpdate(
    task: TranslationTask,
  ): Prisma.TranslationTaskUpdateInput {
    const {
      originalContent,
      type: formatType,
      originalStructure,
      currentStage,
      status,
      languagePairId,
      editorId,
      assignedAt,
      completedAt,
      isEvaluationTask,
    } = task;

    return {
      originalContent,
      formatType,
      originalStructure: originalStructure || ({} as OriginalStructure),
      currentStage,
      status,
      languagePair: { connect: { id: languagePairId } },
      ...(editorId && { editor: { connect: { id: editorId } } }),
      assignedAt,
      completedAt,
      isEvaluationTask,
    };
  }

  toPersistenceForCreate(
    task: TranslationTask,
  ): Prisma.TranslationTaskCreateInput {
    const {
      id,
      originalContent,
      type: formatType,
      originalStructure,
      finalContent,
      currentStage,
      status,
      languagePairId,
      editorId,
      assignedAt,
      completedAt,
      isEvaluationTask,
    } = task;

    return {
      id,
      originalContent,
      formatType,
      originalStructure: originalStructure || ({} as OriginalStructure),
      ...(finalContent !== undefined && { finalContent }),
      currentStage,
      status,
      languagePair: { connect: { id: languagePairId } },
      ...(editorId && { editor: { connect: { id: editorId } } }),
      assignedAt,
      completedAt,
      isEvaluationTask,
    };
  }
}
