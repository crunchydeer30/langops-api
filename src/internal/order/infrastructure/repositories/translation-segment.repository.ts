import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { ITranslationSegmentRepository } from '../../domain/ports/translation-segment.repository';
import { TranslationSegment } from '../../domain/entities/translation-segment.entity';
import { TranslationSegmentMapper } from '../mappers/translation-segment.mapper';

@Injectable()
export class TranslationSegmentRepository
  implements ITranslationSegmentRepository
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: TranslationSegmentMapper,
  ) {}

  async findById(id: string): Promise<TranslationSegment | null> {
    const model = await this.prisma.translationSegment.findUnique({
      where: { id },
    });
    if (!model) {
      return null;
    }
    return this.mapper.toDomain(model);
  }

  async findByOrderId(orderId: string): Promise<TranslationSegment[]> {
    const models = await this.prisma.translationSegment.findMany({
      where: { orderId },
      orderBy: { sequenceNumber: 'asc' },
    });
    return models.map((model) => this.mapper.toDomain(model));
  }

  async save(segment: TranslationSegment): Promise<void> {
    const data = this.mapper.toPersistence(segment);

    await this.prisma.translationSegment.upsert({
      where: { id: segment.id },
      update: data,
      create: data,
    });
  }

  async saveMany(segments: TranslationSegment[]): Promise<void> {
    const operations = segments.map((segment) => {
      const data = this.mapper.toPersistence(segment);

      return this.prisma.translationSegment.upsert({
        where: { id: segment.id },
        update: data,
        create: data,
      });
    });

    await this.prisma.$transaction(operations);
  }
}
