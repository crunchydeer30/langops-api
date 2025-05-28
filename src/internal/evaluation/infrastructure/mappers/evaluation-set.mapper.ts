import { Injectable } from '@nestjs/common';
import { EvaluationSet } from '../../domain/entities';
import { Prisma, EvaluationSet as PrismaEvaluationSet } from '@prisma/client';

@Injectable()
export class EvaluationSetMapper {
  toDomain(raw: PrismaEvaluationSet): EvaluationSet {
    return EvaluationSet.reconstitute({
      id: raw.id,
      type: raw.type,
      status: raw.status,
      editorId: raw.editorId,
      languagePairId: raw.languagePairId,
      evaluatorId: raw.evaluatorId,
      editorLanguagePairId: raw.editorLanguagePairId,
      averageRating: raw.averageRating,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  toPersistence(domain: EvaluationSet): Prisma.EvaluationSetCreateInput {
    return {
      id: domain.id,
      type: domain.type,
      status: domain.status,
      editor: {
        connect: {
          id: domain.editorId,
        },
      },
      languagePair: {
        connect: {
          id: domain.languagePairId,
        },
      },
      evaluator: domain.evaluatorId
        ? {
            connect: {
              id: domain.evaluatorId,
            },
          }
        : undefined,
      editorLanguagePair: domain.editorLanguagePairId
        ? {
            connect: {
              id: domain.editorLanguagePairId,
            },
          }
        : undefined,
      averageRating: domain.averageRating,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  toUpdatePersistence(domain: EvaluationSet): Prisma.EvaluationSetUpdateInput {
    return {
      type: domain.type,
      status: domain.status,
      editor: {
        connect: {
          id: domain.editorId,
        },
      },
      languagePair: {
        connect: {
          id: domain.languagePairId,
        },
      },
      evaluator: domain.evaluatorId
        ? {
            connect: {
              id: domain.evaluatorId,
            },
          }
        : undefined,
      editorLanguagePair: domain.editorLanguagePairId
        ? {
            connect: {
              id: domain.editorLanguagePairId,
            },
          }
        : undefined,
      averageRating: domain.averageRating,
      updatedAt: domain.updatedAt,
    };
  }
}
