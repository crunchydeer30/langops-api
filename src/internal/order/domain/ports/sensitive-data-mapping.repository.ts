import { SensitiveDataMapping } from '../entities/sensitive-data-mapping.entity';

export interface ISensitiveDataMappingRepository {
  save(mapping: SensitiveDataMapping): Promise<void>;
  findByOrderId(orderId: string): Promise<SensitiveDataMapping | null>;
}
