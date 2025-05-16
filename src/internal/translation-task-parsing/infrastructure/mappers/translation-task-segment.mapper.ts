import { Injectable } from '@nestjs/common';
import {
  TranslationTaskSegment as TranslationTaskSegmentModel,
  Prisma,
} from '@prisma/client';
import {
  TranslationTaskSegment,
  ITranslationTaskSegment,
} from '../../domain/entities/translation-task-segment.entity';

@Injectable()
export class TranslationTaskSegmentMapper {
  toDomain(model: TranslationTaskSegmentModel): TranslationTaskSegment {
    const props: ITranslationTaskSegment = {
      id: model.id,
      translationTaskId: model.translationTaskId,
      segmentOrder: model.segmentOrder,
      sourceContent: model.sourceContent,
      machineTranslatedContent: model.machineTranslatedContent,
      editedContent: model.editedContent,
      specialTokensMap: model.specialTokensMap,

      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return TranslationTaskSegment.reconstitute(props);
  }

  toPersistenceForCreate(
    entity: TranslationTaskSegment,
  ): Prisma.TranslationTaskSegmentCreateInput {
    return {
      id: entity.id,
      translationTask: {
        connect: { id: entity.translationTaskId },
      },
      segmentOrder: entity.segmentOrder,
      sourceContent: entity.sourceContent,
      machineTranslatedContent: entity.machineTranslatedContent,
      editedContent: entity.editedContent,
      specialTokensMap: entity.specialTokensMap,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toPersistenceForUpdate(
    entity: TranslationTaskSegment,
  ): Prisma.TranslationTaskSegmentUpdateInput {
    return {
      segmentOrder: entity.segmentOrder,
      sourceContent: entity.sourceContent,
      machineTranslatedContent: entity.machineTranslatedContent,
      editedContent: entity.editedContent,
      specialTokensMap: entity.specialTokensMap,
      updatedAt: entity.updatedAt,
    };
  }
}
