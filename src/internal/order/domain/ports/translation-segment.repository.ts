import { TranslationSegment } from '../entities/translation-segment.entity';

export interface ITranslationSegmentRepository {
  findById(id: string): Promise<TranslationSegment | null>;
  findByOrderId(orderId: string): Promise<TranslationSegment[]>;
  save(segment: TranslationSegment): Promise<void>;
  saveMany(segments: TranslationSegment[]): Promise<void>;
}
