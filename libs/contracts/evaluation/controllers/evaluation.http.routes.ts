export const EVALUATION_HTTP_CONTROLLER = 'evaluation';

export const EVALUATION_HTTP_ROUTES = {
  INITIATE_EVALUATION: '/initiate',
  PENDING_REVIEW: '/pending-review',
  START_REVIEW: '/:evaluationId/review',
  GET_EVALUATION_TASKS: '/:evaluationId/tasks',
  GET_EVALUATION_TASK_DETAILS: '/:evaluationId/tasks/:taskId',
  RATE_TASK: (evaluationId: string, taskId: string) =>
    `/${evaluationId}/tasks/${taskId}/rate`,
} as const;
