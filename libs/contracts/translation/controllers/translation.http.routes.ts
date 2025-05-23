export const TRANSLATION_HTTP_CONTROLLER = {
  ROOT: 'translation',
};

export const TRANSLATION_HTTP_ROUTES = {
  CREATE: '',
  GET_BY_ID: ':uuid',
  LIST: '',
  CREATE_MT: '/mt_translation',
  GET_MT_BY_ID: '/mt_translation/:uuid',
} as const;
