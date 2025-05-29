import { EvaluationType } from '@prisma/client';
import { EvaluationSet } from '../entities';

export interface IEvaluationSetRepository {
  findById(id: string): Promise<EvaluationSet | null>;
  findByEditorIdAndLanguagePairId(
    editorId: string,
    languagePairId: string,
  ): Promise<EvaluationSet[]>;
  findByEditorId(editorId: string): Promise<EvaluationSet[]>;
  save(evaluationSet: EvaluationSet): Promise<EvaluationSet>;
  generateInitialEvaluation(
    evaluationType: EvaluationType,
    editorId: string,
    languagePairId: string,
    editorLanguagePairId?: string | null,
    evaluatorId?: string | null,
    limit?: number,
  ): Promise<EvaluationSet>;
  findPendingReviewSets(
    languagePairIds: string[],
    specificLanguagePairId?: string,
  ): Promise<EvaluationSet[]>;
}
