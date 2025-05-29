import { EvaluationSet } from '../entities/evaluation-set.entity';

export interface IEvaluationSetRepository {
  findById(id: string): Promise<EvaluationSet | null>;
  findBySeniorEditorId(seniorEditorId: string): Promise<EvaluationSet[]>;
  findPendingForReview(): Promise<EvaluationSet[]>;
  save(evaluationSet: EvaluationSet): Promise<EvaluationSet>;
}
