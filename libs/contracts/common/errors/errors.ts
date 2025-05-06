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
  CUSTOMER: {
    RESET_PASSWORD_TOKEN_INVALID: {
      code: 'CUSTOMER_001',
      message: 'Password reset token is either expired or invalid',
      httpStatus: 400,
    },
    EMAIL_ALREADY_VERIFIED: {
      code: 'CUSTOMER_002',
      message: 'Email already verified',
      httpStatus: 400,
    },
    EMAIL_VERIFICATION_TOKEN_INVALID: {
      code: 'CUSTOMER_003',
      message: 'Email verification token is either expired or invalid',
      httpStatus: 400,
    },
    EMAIL_CONFLICT: {
      code: 'CUSTOMER_004',
      message: 'Email is already in use',
      httpStatus: 409,
    },
  },
  EDITOR: {
    NOT_FOUND: {
      code: 'EDITOR_001',
      message: 'Editor not found.',
      httpStatus: 404,
    },
    EMAIL_ALREADY_EXISTS: {
      code: 'EDITOR_002',
      message: 'Email already exists for an editor.',
      httpStatus: 409,
    },
    INVALID_CREDENTIALS: {
      code: 'EDITOR_003',
      message: 'Invalid editor credentials.',
      httpStatus: 401,
    },
    EMAIL_VERIFICATION_TOKEN_INVALID: {
      code: 'EDITOR_004',
      message: 'Editor email verification token is invalid.',
      httpStatus: 400,
    },
    EMAIL_ALREADY_VERIFIED: {
      code: 'EDITOR_005',
      message: 'Editor email is already verified.',
      httpStatus: 400,
    },
    RESET_PASSWORD_TOKEN_INVALID: {
      code: 'EDITOR_006',
      message: 'Editor password reset token is either expired or invalid',
      httpStatus: 400,
    },
  },
} as const;
