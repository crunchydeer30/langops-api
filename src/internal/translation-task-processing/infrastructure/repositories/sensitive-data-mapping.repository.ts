import { Injectable } from '@nestjs/common';
import { SensitiveDataMapping } from '../../domain/entities/sensitive-data-mapping.entity';
import { ISensitiveDataMappingRepository } from '../../domain/ports/sensitive-data-mapping.repository';
import { SensitiveDataMappingMapper } from '../mappers/sensitive-data-mapping.mapper';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class SensitiveDataMappingRepository
  implements ISensitiveDataMappingRepository
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: SensitiveDataMappingMapper,
  ) {}

  async findBySegmentId(segmentId: string): Promise<SensitiveDataMapping[]> {
    const mappings = await this.prisma.sensitiveDataMapping.findMany({
      where: {
        translationSegmentId: segmentId,
      },
    });

    return mappings.map((mapping) => this.mapper.toDomain(mapping));
  }

  async findBySegmentIdAndToken(
    segmentId: string,
    tokenIdentifier: string,
  ): Promise<SensitiveDataMapping | null> {
    const mapping = await this.prisma.sensitiveDataMapping.findUnique({
      where: {
        translationSegmentId_tokenIdentifier: {
          translationSegmentId: segmentId,
          tokenIdentifier,
        },
      },
    });

    return mapping ? this.mapper.toDomain(mapping) : null;
  }

  async save(mapping: SensitiveDataMapping): Promise<void> {
    const data = this.mapper.toPrisma(mapping);

    await this.prisma.sensitiveDataMapping.upsert({
      where: { id: mapping.id },
      update: data,
      create: data,
    });
  }

  async saveMany(mappings: SensitiveDataMapping[]): Promise<void> {
    if (mappings.length === 0) return;

    await this.prisma.$transaction(
      mappings.map((mapping) => {
        const data = this.mapper.toPrisma(mapping);
        return this.prisma.sensitiveDataMapping.upsert({
          where: { id: mapping.id },
          update: data,
          create: data,
        });
      }),
    );
  }

  async deleteBySegmentId(segmentId: string): Promise<void> {
    await this.prisma.sensitiveDataMapping.deleteMany({
      where: {
        translationSegmentId: segmentId,
      },
    });
  }
}
