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
      sourceLanguageCode: prismaLanguagePair.sourceLanguageCode,
      targetLanguageCode: prismaLanguagePair.targetLanguageCode,
      sourceLanguage: {
        code: prismaLanguagePair.sourceLanguage.code,
        name: prismaLanguagePair.sourceLanguage.name,
      },
      targetLanguage: {
        code: prismaLanguagePair.targetLanguage.code,
        name: prismaLanguagePair.targetLanguage.name,
      },
      isAcceptingEditors: prismaLanguagePair.isAcceptingEditors,
      createdAt: prismaLanguagePair.createdAt,
      updatedAt: prismaLanguagePair.updatedAt,
    });
  }

  toPersistence(languagePair: LanguagePair): {
    id: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
    isAcceptingEditors: boolean;
  } {
    return {
      id: languagePair.id,
      sourceLanguageCode: languagePair.sourceLanguageCode,
      targetLanguageCode: languagePair.targetLanguageCode,
      isAcceptingEditors: languagePair.isAcceptingEditors,
    };
  }
}
