import { EvaluationTask } from '../entities/evaluation-task.entity';

export interface IEvaluationTaskRepository {
  findById(id: string): Promise<EvaluationTask | null>;
  findByEvaluationSetId(evaluationSetId: string): Promise<EvaluationTask[]>;
  save(task: EvaluationTask): Promise<void>;
}
