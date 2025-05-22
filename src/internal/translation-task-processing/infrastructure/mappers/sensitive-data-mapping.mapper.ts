import { Injectable } from '@nestjs/common';
import { SensitiveDataMapping as PrismaSensitiveDataMapping } from '@prisma/client';
import { SensitiveDataMapping } from '../../domain/entities/sensitive-data-mapping.entity';

@Injectable()
export class SensitiveDataMappingMapper {
  toDomain(prismaEntity: PrismaSensitiveDataMapping): SensitiveDataMapping {
    return SensitiveDataMapping.reconstitute({
      id: prismaEntity.id,
      translationTaskId: prismaEntity.translationTaskId,
      tokenIdentifier: prismaEntity.tokenIdentifier,
      sensitiveType: prismaEntity.sensitiveType,
      originalValue: prismaEntity.originalValue,
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
    });
  }

  toPrisma(
    domainEntity: SensitiveDataMapping,
  ): Omit<PrismaSensitiveDataMapping, 'createdAt' | 'updatedAt'> {
    return {
      id: domainEntity.id,
      translationTaskId: domainEntity.translationTaskId,
      tokenIdentifier: domainEntity.tokenIdentifier,
      sensitiveType: domainEntity.sensitiveType,
      originalValue: domainEntity.originalValue,
    };
  }
}
