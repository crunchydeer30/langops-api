import { TranslationTask } from '../entities/translation-task.entity';

export interface ITranslationTaskRepository {
  findById(id: string): Promise<TranslationTask | null>;
  findByOrderId(orderId: string): Promise<TranslationTask[]>;
  save(task: TranslationTask): Promise<void>;
}
