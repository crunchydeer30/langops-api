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
  EDITOR_APPLICATION: {
    INVALID_STATUS_TRANSITION: {
      code: 'EDITOR_APPLICATION_001',
      message: 'Invalid status transition',
      httpStatus: 400,
    },
    INVALID_TOKEN_GENERATION: {
      code: 'EDITOR_APPLICATION_002',
      message: 'Invalid token generation',
      httpStatus: 400,
    },
    NO_REGISTRATION_TOKEN: {
      code: 'EDITOR_APPLICATION_003',
      message: 'No registration token',
      httpStatus: 400,
    },
    TOKEN_ALREADY_USED: {
      code: 'EDITOR_APPLICATION_004',
      message: 'Token already used',
      httpStatus: 400,
    },
    ALREADY_EXISTS: {
      code: 'EDITOR_APPLICATION_005',
      message: 'Editor application already exists',
      httpStatus: 409,
    },
    NOT_FOUND: {
      code: 'EDITOR_APPLICATION_006',
      message: 'Editor application not found',
      httpStatus: 404,
    },
    REGISTRATION_TOKEN_INVALID: {
      code: 'EDITOR_APPLICATION_007',
      message: 'Invalid registration token',
      httpStatus: 400,
    },
  },
  STAFF: {
    NOT_FOUND: {
      code: 'STAFF_001',
      message: 'Staff member not found.',
      httpStatus: 404,
    },
    EMAIL_CONFLICT: {
      code: 'STAFF_002',
      message: 'Email is already in use by a staff member.',
      httpStatus: 409,
    },
    EMAIL_VERIFICATION_TOKEN_INVALID: {
      code: 'STAFF_003',
      message:
        'Staff member email verification token is either expired or invalid',
      httpStatus: 400,
    },
    EMAIL_ALREADY_VERIFIED: {
      code: 'STAFF_004',
      message: 'Staff member email is already verified.',
      httpStatus: 400,
    },
    RESET_PASSWORD_TOKEN_INVALID: {
      code: 'STAFF_005',
      message: 'Staff member password reset token is either expired or invalid',
      httpStatus: 400,
    },
  },
} as const;
