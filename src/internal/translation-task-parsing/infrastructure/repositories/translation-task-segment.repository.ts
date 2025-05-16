import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { TranslationTaskSegment } from '../../domain/entities/translation-task-segment.entity';
import { TranslationTaskSegmentMapper } from '../mappers/translation-task-segment.mapper';
import { ITranslationTaskSegmentRepository } from '../../domain/ports';

@Injectable()
export class TranslationTaskSegmentRepository
  implements ITranslationTaskSegmentRepository
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: TranslationTaskSegmentMapper,
  ) {}

  async findById(id: string): Promise<TranslationTaskSegment | null> {
    const model = await this.prisma.translationTaskSegment.findUnique({
      where: { id },
    });
    if (!model) {
      return null;
    }
    return this.mapper.toDomain(model);
  }

  async findByTranslationTaskId(
    translationTaskId: string,
  ): Promise<TranslationTaskSegment[]> {
    const models = await this.prisma.translationTaskSegment.findMany({
      where: { translationTaskId },
      orderBy: { segmentOrder: 'asc' },
    });
    return models.map((model) => this.mapper.toDomain(model));
  }

  async save(segment: TranslationTaskSegment): Promise<void> {
    await this.prisma.translationTaskSegment.upsert({
      where: { id: segment.id },
      create: this.mapper.toPersistenceForCreate(segment),
      update: this.mapper.toPersistenceForUpdate(segment),
    });
  }

  async saveMany(segments: TranslationTaskSegment[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const segment of segments) {
        await tx.translationTaskSegment.upsert({
          where: { id: segment.id },
          create: this.mapper.toPersistenceForCreate(segment),
          update: this.mapper.toPersistenceForUpdate(segment),
        });
      }
    });
  }
}
