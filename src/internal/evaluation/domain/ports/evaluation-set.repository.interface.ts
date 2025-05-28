import { EvaluationSet } from '../entities';

export interface IEvaluationSetRepository {
  findById(id: string): Promise<EvaluationSet | null>;
  findByEditorIdAndLanguagePairId(
    editorId: string,
    languagePairId: string,
  ): Promise<EvaluationSet[]>;
  findByEditorId(editorId: string): Promise<EvaluationSet[]>;
  save(evaluationSet: EvaluationSet): Promise<EvaluationSet>;
}
