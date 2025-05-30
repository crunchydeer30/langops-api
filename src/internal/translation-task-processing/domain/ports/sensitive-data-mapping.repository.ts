import { SensitiveDataMapping } from '../entities/sensitive-data-mapping.entity';

export interface ISensitiveDataMappingRepository {
  findBySegmentId(segmentId: string): Promise<SensitiveDataMapping[]>;
  findBySegmentIdAndToken(
    segmentId: string,
    tokenIdentifier: string,
  ): Promise<SensitiveDataMapping | null>;
  save(mapping: SensitiveDataMapping): Promise<void>;
  saveMany(mappings: SensitiveDataMapping[]): Promise<void>;
  deleteBySegmentId(segmentId: string): Promise<void>;
}
