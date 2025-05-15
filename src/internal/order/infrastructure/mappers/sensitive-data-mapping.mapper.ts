import { Injectable } from '@nestjs/common';
import { SensitiveDataMapping } from '../../domain/entities/sensitive-data-mapping.entity';
import {
  Prisma,
  SensitiveDataMapping as PrismaSensitiveDataMapping,
} from '@prisma/client';

@Injectable()
export class SensitiveDataMappingMapper {
  toDomain(model: PrismaSensitiveDataMapping): SensitiveDataMapping {
    return new SensitiveDataMapping({
      id: model.id,
      orderId: model.orderId,
      tokenMap: model.tokenMap,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  toPersistence(
    entity: SensitiveDataMapping,
  ): Prisma.SensitiveDataMappingUncheckedCreateInput {
    return {
      id: entity.id,
      orderId: entity.orderId,
      tokenMap: entity.tokenMap,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
