import { TranslationTask } from '../entities/translation-task.entity';

export interface ITranslationTaskRepository {
  findById(id: string): Promise<TranslationTask | null>;
  save(task: TranslationTask): Promise<void>;
  countQueuedForEditing(languagePairId: string): Promise<number>;
  countQueuedForEvaluation(languagePairId: string): Promise<number>;
  isEditorQualifiedForLanguagePair(
    editorId: string,
    languagePairId: string,
  ): Promise<boolean>;
  isEditorEligibleForEvaluation(
    editorId: string,
    languagePairId: string,
  ): Promise<boolean>;
  findEvaluationTaskForEditor(
    editorId: string,
    languagePairId: string,
  ): Promise<TranslationTask | null>;
  findTaskWithSegments(
    taskId: string,
  ): Promise<{ task: TranslationTask; segments: any[] } | null>;
}
