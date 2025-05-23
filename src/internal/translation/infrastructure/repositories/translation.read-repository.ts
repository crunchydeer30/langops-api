import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { TranslationReadModel } from '../../domain/models';

@Injectable()
export class TranslationReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TranslationReadModel | null> {
    const translation = await this.prisma.translationTask.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            languagePair: {
              include: {
                sourceLanguage: true,
                targetLanguage: true,
              },
            },
          },
        },
      },
    });

    if (!translation) return null;

    return {
      id: translation.id,
      orderId: translation.orderId,
      formatType: translation.formatType,
      status: translation.status,
      currentStage: translation.currentStage,
      wordCount: translation.wordCount,
      createdAt: translation.createdAt,
      originalContent: translation.originalContent,
      translatedContent: null, // TODO: Decide what to do with it
      sourceLanguage: translation.order.languagePair.sourceLanguage.code,
      targetLanguage: translation.order.languagePair.targetLanguage.code,
      customerId: translation.order.customerId,
    };
  }

  async findByIdAndCustomerId(
    id: string,
    customerId: string,
  ): Promise<TranslationReadModel | null> {
    const translation = await this.prisma.translationTask.findFirst({
      where: {
        id,
        order: {
          customerId,
        },
      },
      include: {
        order: {
          include: {
            customer: true,
            languagePair: {
              include: {
                sourceLanguage: true,
                targetLanguage: true,
              },
            },
          },
        },
      },
    });

    if (!translation) return null;

    return {
      id: translation.id,
      orderId: translation.orderId,
      formatType: translation.formatType,
      status: translation.status,
      currentStage: translation.currentStage,
      wordCount: translation.wordCount,
      createdAt: translation.createdAt,
      originalContent: translation.originalContent,
      translatedContent: null, // TODO: Decide what to do with it
      sourceLanguage: translation.order.languagePair.sourceLanguage.code,
      targetLanguage: translation.order.languagePair.targetLanguage.code,
      customerId: translation.order.customerId,
    };
  }

  async findByCustomerId(
    customerId: string,
    limit = 20,
    offset = 0,
  ): Promise<TranslationReadModel[]> {
    const translations = await this.prisma.translationTask.findMany({
      where: {
        order: {
          customerId,
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        order: {
          include: {
            customer: true,
            languagePair: {
              include: {
                sourceLanguage: true,
                targetLanguage: true,
              },
            },
          },
        },
      },
    });

    return translations.map((translation) => {
      const { order } = translation;
      return {
        id: translation.id,
        orderId: translation.orderId,
        formatType: translation.formatType,
        status: translation.status,
        currentStage: translation.currentStage,
        wordCount: translation.wordCount,
        createdAt: translation.createdAt,
        originalContent: translation.originalContent,
        translatedContent: null, // TODO: Decide what to do with it
        sourceLanguage: order.languagePair.sourceLanguage.code,
        targetLanguage: order.languagePair.targetLanguage.code,
        customerId: order.customerId,
      };
    });
  }
}
