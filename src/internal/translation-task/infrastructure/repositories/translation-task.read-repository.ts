import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { TranslationTaskReadModel } from '../../domain/models';

@Injectable()
export class TranslationTaskReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TranslationTaskReadModel | null> {
    const task = await this.prisma.translationTask.findUnique({
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

    if (!task) return null;

    return {
      id: task.id,
      orderId: task.orderId,
      formatType: task.formatType,
      status: task.status,
      currentStage: task.currentStage,
      wordCount: task.wordCount,
      createdAt: task.createdAt,
      originalContent: task.originalContent,
      translatedContent: null, // TODO: Decide what to do with it
      sourceLanguage: task.order.languagePair.sourceLanguage.code,
      targetLanguage: task.order.languagePair.targetLanguage.code,
      customerId: task.order.customerId,
    };
  }

  async findByIdAndCustomerId(
    id: string,
    customerId: string,
  ): Promise<TranslationTaskReadModel | null> {
    const task = await this.prisma.translationTask.findFirst({
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

    if (!task) return null;

    return {
      id: task.id,
      orderId: task.orderId,
      formatType: task.formatType,
      status: task.status,
      currentStage: task.currentStage,
      wordCount: task.wordCount,
      createdAt: task.createdAt,
      originalContent: task.originalContent,
      translatedContent: null, // TODO: Decide what to do with it
      sourceLanguage: task.order.languagePair.sourceLanguage.code,
      targetLanguage: task.order.languagePair.targetLanguage.code,
      customerId: task.order.customerId,
    };
  }
}
