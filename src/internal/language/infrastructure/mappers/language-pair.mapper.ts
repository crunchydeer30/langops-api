import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LanguagePair } from '../../domain';

@Injectable()
export class LanguagePairMapper {
  toDomain(
    prismaLanguagePair: Prisma.LanguagePairGetPayload<{
      include: {
        sourceLanguage: true;
        targetLanguage: true;
      };
    }>,
  ): LanguagePair {
    return LanguagePair.reconstitute({
      id: prismaLanguagePair.id,
      sourceLanguageId: prismaLanguagePair.sourceLanguageId,
      targetLanguageId: prismaLanguagePair.targetLanguageId,
      sourceLanguage: {
        code: prismaLanguagePair.sourceLanguage.code,
        name: prismaLanguagePair.sourceLanguage.name,
      },
      targetLanguage: {
        code: prismaLanguagePair.targetLanguage.code,
        name: prismaLanguagePair.targetLanguage.name,
      },
      createdAt: prismaLanguagePair.createdAt,
      updatedAt: prismaLanguagePair.updatedAt,
    });
  }

  toPersistence(languagePair: LanguagePair): {
    id: string;
    sourceLanguageId: string;
    targetLanguageId: string;
  } {
    return {
      id: languagePair.id,
      sourceLanguageId: languagePair.sourceLanguageId,
      targetLanguageId: languagePair.targetLanguageId,
    };
  }
}
