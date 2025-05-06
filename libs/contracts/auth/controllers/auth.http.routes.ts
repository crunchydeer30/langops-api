export const AUTH_HTTP_CONTROLLER = {
  CUSTOMER: 'auth/customer',
  EDITOR: 'auth/editor',
};

export const AUTH_HTTP_ROUTES = {
  CUSTOMER: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  EDITOR: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
} as const;
