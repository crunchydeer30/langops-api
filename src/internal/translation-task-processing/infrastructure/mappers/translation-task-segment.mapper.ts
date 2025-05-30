import { Injectable } from '@nestjs/common';
import {
  TranslationTaskSegment as TranslationTaskSegmentModel,
  Prisma,
} from '@prisma/client';
import {
  TranslationTaskSegment,
  ITranslationTaskSegment,
} from '../../domain/entities/translation-task-segment.entity';
import type { TranslationSpecialTokenMap } from '../../domain/interfaces/translation-segment-token-map.interface';
import type { FormatMetadata } from '../../domain/interfaces/format-metadata.interface';

@Injectable()
export class TranslationTaskSegmentMapper {
  toDomain(model: TranslationTaskSegmentModel): TranslationTaskSegment {
    const props: ITranslationTaskSegment = {
      id: model.id,
      translationTaskId: model.translationTaskId,
      segmentOrder: model.segmentOrder,
      segmentType: model.segmentType,
      sourceContent: model.sourceContent,
      machineTranslatedContent: model.machineTranslatedContent,
      editedContent: model.editedContent,
      specialTokensMap:
        model.specialTokensMap as unknown as TranslationSpecialTokenMap,
      formatMetadata: model.formatMetadata as unknown as FormatMetadata,

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
      segmentType: entity.segmentType,
      sourceContent: entity.sourceContent,
      machineTranslatedContent: entity.machineTranslatedContent,
      editedContent: entity.editedContent,
      specialTokensMap: entity.specialTokensMap || {},
      formatMetadata: entity.formatMetadata || ({} as FormatMetadata),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toPersistenceForUpdate(
    entity: TranslationTaskSegment,
  ): Prisma.TranslationTaskSegmentUpdateInput {
    return {
      segmentOrder: entity.segmentOrder,
      segmentType: entity.segmentType,
      sourceContent: entity.sourceContent,
      machineTranslatedContent: entity.machineTranslatedContent,
      editedContent: entity.editedContent,
      specialTokensMap: entity.specialTokensMap || {},
      formatMetadata: entity.formatMetadata || ({} as FormatMetadata),
      updatedAt: entity.updatedAt,
    };
  }
}
