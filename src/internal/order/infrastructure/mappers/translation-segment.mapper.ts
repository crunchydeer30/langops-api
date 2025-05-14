import { Injectable } from '@nestjs/common';
import { TranslationSegment } from '../../domain/entities/translation-segment.entity';
import {
  Prisma,
  TranslationSegment as PrismaTranslationSegment,
} from '@prisma/client';

@Injectable()
export class TranslationSegmentMapper {
  toDomain(prismaModel: PrismaTranslationSegment): TranslationSegment {
    return new TranslationSegment({
      id: prismaModel.id,
      orderId: prismaModel.orderId,
      evaluationTaskId: prismaModel.evaluationTaskId || null,
      sequenceNumber: prismaModel.sequenceNumber,
      originalText: prismaModel.originalText,
      aiTranslatedText: prismaModel.aiTranslatedText,
      humanEditedText: prismaModel.humanEditedText,
      finalApprovedText: prismaModel.finalApprovedText,
      createdAt: prismaModel.createdAt,
      updatedAt: prismaModel.updatedAt,
    });
  }

  toPersistence(
    domain: TranslationSegment,
  ): Prisma.TranslationSegmentUncheckedCreateInput {
    const model: PrismaTranslationSegment = {
      id: domain.id,
      sequenceNumber: domain.sequenceNumber,
      originalText: domain.originalText,
      aiTranslatedText: domain.aiTranslatedText,
      humanEditedText: domain.humanEditedText,
      finalApprovedText: domain.finalApprovedText,
      orderId: domain.orderId,
      evaluationTaskId: domain.evaluationTaskId,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };

    return model;
  }
}
