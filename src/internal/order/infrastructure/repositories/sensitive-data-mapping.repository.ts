import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { ISensitiveDataMappingRepository } from '../../domain/ports/sensitive-data-mapping.repository';
import { SensitiveDataMapping } from '../../domain/entities/sensitive-data-mapping.entity';
import { SensitiveDataMappingMapper } from '../mappers/sensitive-data-mapping.mapper';

@Injectable()
export class SensitiveDataMappingRepository
  implements ISensitiveDataMappingRepository
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: SensitiveDataMappingMapper,
  ) {}

  async save(mapping: SensitiveDataMapping): Promise<void> {
    const data = this.mapper.toPersistence(mapping);
    await this.prisma.sensitiveDataMapping.upsert({
      where: { orderId: mapping.orderId },
      update: data,
      create: data,
    });
  }

  async findByOrderId(orderId: string): Promise<SensitiveDataMapping | null> {
    const model = await this.prisma.sensitiveDataMapping.findUnique({
      where: { orderId },
    });
    if (!model) return null;
    return this.mapper.toDomain(model);
  }
}
