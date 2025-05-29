import { EvaluationTask } from '../entities/evaluation-task.entity';

export interface IEvaluationTaskSegmentData {
  id: string;
  sourceSegmentText: string;
  machineTranslatedText: string;
  editedTranslatedText: string | null;
  order: number;
}

export interface IEvaluationTaskWithSegments extends EvaluationTask {
  segments: IEvaluationTaskSegmentData[];
}

export interface IEvaluationTaskRepository {
  findById(id: string): Promise<EvaluationTask | null>;
  findTaskWithSegments(
    taskId: string,
    evaluationSetId?: string,
  ): Promise<IEvaluationTaskWithSegments | null>;
  findByEvaluationSetId(evaluationSetId: string): Promise<EvaluationTask[]>;
  save(evaluationTask: EvaluationTask): Promise<EvaluationTask>;
}
