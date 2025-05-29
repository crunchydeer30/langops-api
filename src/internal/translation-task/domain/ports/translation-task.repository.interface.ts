import { TranslationTask } from '../entities/translation-task.entity';

export interface ITranslationTaskRepository {
  findById(id: string): Promise<TranslationTask | null>;
  save(task: TranslationTask): Promise<void>;
  countQueuedForEditing(languagePairId: string): Promise<number>;
}
