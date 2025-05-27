import { Injectable } from '@nestjs/common';
import {
  Translation as PrismaTranslation,
  TranslationTaskType,
  TranslationStatus,
} from '@prisma/client';
import { Translation } from '../../domain/entities/translation.entity';

@Injectable()
export class TranslationMapper {
  toDomain(prismaTranslation: PrismaTranslation): Translation {
    return Translation.reconstitute({
      id: prismaTranslation.id,
      customerId: prismaTranslation.customerId,
      sourceLanguageCode: prismaTranslation.sourceLanguageCode,
      targetLanguageCode: prismaTranslation.targetLanguageCode,
      originalContent: prismaTranslation.originalContent,
      translatedContent: prismaTranslation.translatedContent,
      format: prismaTranslation.format,
      status: prismaTranslation.status,
      translationTaskId: prismaTranslation.translationTaskId,
      createdAt: prismaTranslation.createdAt,
      updatedAt: prismaTranslation.updatedAt,
    });
  }

  toPersistence(translation: Translation): {
    id: string;
    customerId: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
    originalContent: string;
    translatedContent: string | null;
    format: TranslationTaskType;
    status: TranslationStatus;
    translationTaskId: string | null;
  } {
    return {
      id: translation.id,
      customerId: translation.customerId,
      sourceLanguageCode: translation.sourceLanguageCode,
      targetLanguageCode: translation.targetLanguageCode,
      originalContent: translation.originalContent,
      translatedContent: translation.translatedContent || null,
      format: translation.format,
      status: translation.status,
      translationTaskId: translation.translationTaskId || null,
    };
  }
}
