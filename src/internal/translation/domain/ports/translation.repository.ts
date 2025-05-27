import { Translation } from '../entities';

export interface ITranslationRepository {
  findById(id: string): Promise<Translation | null>;
  findByCustomerId(customerId: string): Promise<Translation[]>;
  findByTranslationTaskId(
    translationTaskId: string,
  ): Promise<Translation | null>;
  findAll(): Promise<Translation[]>;
  save(translation: Translation): Promise<Translation>;
  delete(id: string): Promise<void>;
}
