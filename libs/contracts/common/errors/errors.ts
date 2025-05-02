export const ERRORS = {
  AUTH: {
    INTERNAL: {
      code: 'AUTH_001',
      httpStatus: 500,
      message: 'Internal error during authentication',
    },
    INVALID_CREDENTIALS: {
      code: 'AUTH_002',
      message: 'Invalid credentials',
      httpStatus: 401,
    },
    EMAIL_CONFLICT: {
      code: 'AUTH_003',
      message: 'Email is already in use',
      httpStatus: 409,
    },
  },
  USER: {
    RESET_PASSWORD_TOKEN_INVALID: {
      code: 'USER_001',
      message: 'Password reset token is either expired or invalid',
      httpStatus: 400,
    },
    EMAIL_ALREADY_VERIFIED: {
      code: 'USER_002',
      message: 'Email already verified',
      httpStatus: 400,
    },
    EMAIL_VERIFICATION_TOKEN_INVALID: {
      code: 'USER_003',
      message: 'Email verification token is either expired or invalid',
      httpStatus: 400,
    },
  },
} as const;
