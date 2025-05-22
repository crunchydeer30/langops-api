import { SensitiveDataMapping } from '../entities/sensitive-data-mapping.entity';

export interface ISensitiveDataMappingRepository {
  findByTaskId(taskId: string): Promise<SensitiveDataMapping[]>;
  findByTaskIdAndToken(
    taskId: string,
    tokenIdentifier: string,
  ): Promise<SensitiveDataMapping | null>;
  save(mapping: SensitiveDataMapping): Promise<void>;
  saveMany(mappings: SensitiveDataMapping[]): Promise<void>;
  deleteByTaskId(taskId: string): Promise<void>;
}
