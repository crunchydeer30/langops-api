import { Injectable } from '@nestjs/common';
import { LanguagePair } from '../../domain/entities';
import { LanguagePair as PrismaLanguagePair } from '@prisma/client';

@Injectable()
export class LanguagePairMapper {
  toDomain(prismaLanguagePair: PrismaLanguagePair): LanguagePair {
    return LanguagePair.reconstitute({
      id: prismaLanguagePair.id,
      sourceLanguageId: prismaLanguagePair.sourceLanguageId,
      targetLanguageId: prismaLanguagePair.targetLanguageId,
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
