import { GetPendingReviewSetsHandler } from './get-pending-review-sets';
import { GetEvaluationTasksHandler } from './get-evaluation-tasks';

export const EvaluationQueryHandlers = [
  GetPendingReviewSetsHandler,
  GetEvaluationTasksHandler,
];

export * from './get-pending-review-sets';
export * from './get-evaluation-tasks';
