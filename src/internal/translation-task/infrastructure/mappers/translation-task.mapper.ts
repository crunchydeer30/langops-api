import {
  Prisma,
  TranslationTask as TranslationTaskModel,
} from '@prisma/client';
import {
  TranslationTask,
  ITranslationTask,
} from '../../domain/entities/translation-task.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslationTaskMapper {
  toDomain(model: TranslationTaskModel): TranslationTask {
    const taskProps: ITranslationTask = {
      id: model.id,
      sourceContent: model.sourceContent,
      currentStage: model.currentStage,
      status: model.status,
      orderId: model.orderId,
      languagePairId: model.languagePairId,
      editorId: model.editorId,
      assignedAt: model.assignedAt,
      type: model.type,
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
      sourceContent,
      currentStage,
      status,
      languagePairId,
      editorId,
      type,
      assignedAt,
      completedAt,
    } = task;

    return {
      sourceContent,
      currentStage,
      status,
      type,
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
      sourceContent,
      currentStage,
      status,
      orderId,
      languagePairId,
      editorId,
      assignedAt,
      type,
      completedAt,
    } = task;

    return {
      id,
      sourceContent,
      currentStage,
      status,
      type,
      order: { connect: { id: orderId } },
      languagePair: { connect: { id: languagePairId } },
      ...(editorId && { editor: { connect: { id: editorId } } }),
      assignedAt,
      completedAt,
    };
  }
}
