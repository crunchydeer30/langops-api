export const EVALUATION_HTTP_CONTROLLER = 'evaluation';

export const EVALUATION_HTTP_ROUTES = {
  INITIATE_EVALUATION: '/initiate',
  PENDING_REVIEW: '/pending-review',
  START_REVIEW: '/:evaluationId/start-review',
} as const;
