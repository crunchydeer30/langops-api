export const EDITOR_APPLICATION_HTTP_CONTROLLER = 'editor-application';

export const EDITOR_APPLICATION_HTTP_ROUTES = {
  SUBMIT: '/submit',
  APPROVE: '/approve/:id',
  REJECT: '/reject/:id',
} as const;
