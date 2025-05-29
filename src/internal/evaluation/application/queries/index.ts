import { GetPendingReviewSetsHandler } from './get-pending-review-sets';
import { GetEvaluationTasksHandler } from './get-evaluation-tasks';
import { GetEvaluationTaskDetailsHandler } from './get-evaluation-task-details';

export const EvaluationQueryHandlers = [
  GetPendingReviewSetsHandler,
  GetEvaluationTasksHandler,
  GetEvaluationTaskDetailsHandler,
];

export * from './get-pending-review-sets';
export * from './get-evaluation-tasks';
export * from './get-evaluation-task-details';
