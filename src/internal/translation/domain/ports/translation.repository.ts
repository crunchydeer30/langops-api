import { Translation } from '../entities';
import { TranslationStatus } from '@prisma/client';

export type TranslationCriteria = {
  id?: string;
  customerId?: string;
  translationTaskId?: string;
  status?: TranslationStatus;
};

export interface ITranslationRepository {
  findById(id: string): Promise<Translation | null>;
  findByCustomerId(customerId: string): Promise<Translation[]>;
  findByTranslationTaskId(
    translationTaskId: string,
  ): Promise<Translation | null>;
  findOneWithCriteria(
    criteria: TranslationCriteria,
  ): Promise<Translation | null>;
  findManyWithCriteria(
    criteria: TranslationCriteria,
    limit?: number,
    offset?: number,
  ): Promise<Translation[]>;
  findAll(): Promise<Translation[]>;
  save(translation: Translation): Promise<Translation>;
  delete(id: string): Promise<void>;
}
