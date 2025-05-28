import { SampleEvaluationContent } from '../entities/sample-evaluation-content.entity';

export interface ISampleEvaluationContentRepository {
  findById(id: string): Promise<SampleEvaluationContent | null>;
  findByLanguagePairId(
    languagePairId: string,
  ): Promise<SampleEvaluationContent[]>;
  save(sampleContent: SampleEvaluationContent): Promise<void>;
}
