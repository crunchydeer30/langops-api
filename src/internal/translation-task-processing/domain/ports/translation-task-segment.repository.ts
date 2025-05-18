import { TranslationTaskSegment } from '../entities/translation-task-segment.entity';

export interface ITranslationTaskSegmentRepository {
  findById(id: string): Promise<TranslationTaskSegment | null>;
  findByTranslationTaskId(
    translationTaskId: string,
  ): Promise<TranslationTaskSegment[]>;
  save(segment: TranslationTaskSegment): Promise<void>;
  saveMany(segments: TranslationTaskSegment[]): Promise<void>;
}
