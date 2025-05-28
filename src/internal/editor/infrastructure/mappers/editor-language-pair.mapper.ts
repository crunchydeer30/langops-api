import { Injectable } from '@nestjs/common';
import { Prisma, EditorLanguagePairQualificationStatus } from '@prisma/client';
import { EditorLanguagePair } from '../../domain/entities/editor-language-pair.entity';

@Injectable()
export class EditorLanguagePairMapper {
  toDomain(
    prismaEditorLanguagePair: Prisma.EditorLanguagePairGetPayload<{
      include: Record<string, never>;
    }>,
  ): EditorLanguagePair {
    return EditorLanguagePair.reconstitute({
      id: prismaEditorLanguagePair.id,
      editorId: prismaEditorLanguagePair.editorId,
      languagePairId: prismaEditorLanguagePair.languagePairId,
      qualificationStatus: prismaEditorLanguagePair.qualificationStatus,
      rating: prismaEditorLanguagePair.rating,
      lastEvaluationAt: prismaEditorLanguagePair.lastEvaluationAt,
      createdAt: prismaEditorLanguagePair.createdAt,
      updatedAt: prismaEditorLanguagePair.updatedAt,
    });
  }

  toPersistence(editorLanguagePair: EditorLanguagePair): {
    id: string;
    editorId: string;
    languagePairId: string;
    qualificationStatus: EditorLanguagePairQualificationStatus;
    rating?: number | null;
    lastEvaluationAt?: Date | null;
  } {
    return {
      id: editorLanguagePair.id,
      editorId: editorLanguagePair.editorId,
      languagePairId: editorLanguagePair.languagePairId,
      qualificationStatus: editorLanguagePair.qualificationStatus,
      rating: editorLanguagePair.rating,
      lastEvaluationAt: editorLanguagePair.lastEvaluationAt,
    };
  }
}
