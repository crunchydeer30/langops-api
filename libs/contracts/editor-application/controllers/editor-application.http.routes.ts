export const EDITOR_APPLICATION_HTTP_CONTROLLER = 'editor-application';

export const EDITOR_APPLICATION_HTTP_ROUTES = {
  SUBMIT: '/submit',
  APPROVE: '/:id/approve',
  REJECT: '/:id/reject',
} as const;
