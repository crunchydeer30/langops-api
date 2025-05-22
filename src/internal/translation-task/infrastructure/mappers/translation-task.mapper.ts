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
      orderId: model.orderId,
      languagePairId: model.languagePairId,
      editorId: model.editorId,
      assignedAt: model.assignedAt,
      wordCount: model.wordCount,
      completedAt: model.completedAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
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
      currentStage,
      status,
      orderId,
      languagePairId,
      editorId,
      assignedAt,
      completedAt,
    } = task;

    return {
      id,
      originalContent,
      formatType,
      originalStructure: originalStructure || ({} as OriginalStructure),
      currentStage,
      status,
      order: { connect: { id: orderId } },
      languagePair: { connect: { id: languagePairId } },
      ...(editorId && { editor: { connect: { id: editorId } } }),
      assignedAt,
      completedAt,
    };
  }
}
