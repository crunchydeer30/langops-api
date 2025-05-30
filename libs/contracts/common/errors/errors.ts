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
  ORDER: {
    NOT_FOUND: {
      code: 'ORDER_001',
      message: 'Order not found',
      httpStatus: 404,
    },
    INVALID_STATUS_TRANSITION: {
      code: 'ORDER_002',
      message: 'Invalid order status transition',
      httpStatus: 400,
    },
    INVALID_ORDER_TYPE: {
      code: 'ORDER_003',
      message: 'Invalid or unsupported order type',
      httpStatus: 400,
    },
    NO_EDITOR_ASSIGNED: {
      code: 'ORDER_004',
      message: 'No editor assigned to this order',
      httpStatus: 400,
    },
    INVALID_OPERATION: {
      code: 'ORDER_005',
      message: 'Invalid operation on order or translation segment',
      httpStatus: 400,
    },
    INVALID_PRICE: {
      code: 'ORDER_006',
      message: 'Invalid price for order',
      httpStatus: 400,
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
    NOT_QUALIFIED_FOR_LANGUAGE_PAIR: {
      code: 'EDITOR_007',
      message: 'Editor is not qualified for this language pair',
      httpStatus: 403,
    },
    NOT_ELIGIBLE_FOR_EVALUATION: {
      code: 'EDITOR_007',
      message:
        'Editor is not eligible for picking evaluation tasks in the language pair',
      httpStatus: 403,
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
  LANGUAGE_PAIR: {
    NOT_FOUND: {
      code: 'LANGUAGE_PAIR_001',
      message: 'Language pair not found',
      httpStatus: 404,
    },
    MULTIPLE_NOT_FOUND: {
      code: 'LANGUAGE_PAIR_002',
      message: 'One or more language pairs not found',
      httpStatus: 404,
    },
    NOT_ACCEPTING_EDITORS: {
      code: 'LANGUAGE_PAIR_003',
      message: 'Language pair is not accepting new editors at this time',
      httpStatus: 400,
    },
  },
  LANGUAGE: {
    NOT_FOUND: {
      code: 'LANGUAGE_001',
      message: 'Language not found',
      httpStatus: 404,
    },
  },
  TRANSLATION: {
    NOT_FOUND: {
      code: 'TRANSLATION_001',
      message: 'Translation not found',
      httpStatus: 404,
    },
    TASK_ALREADY_ASSIGNED: {
      code: 'TRANSLATION_002',
      message: 'Translation task is already assigned to this translation',
      httpStatus: 400,
    },
    NO_TASK_ASSIGNED: {
      code: 'TRANSLATION_003',
      message: 'No translation task is assigned to this translation',
      httpStatus: 400,
    },
    CANNOT_CANCEL_COMPLETED: {
      code: 'TRANSLATION_004',
      message: 'Cannot cancel a completed translation',
      httpStatus: 400,
    },
    CREATION_FAILED: {
      code: 'TRANSLATION_005',
      message: 'Failed to create translation',
      httpStatus: 500,
    },
  },
  TRANSLATION_TASK: {
    NOT_FOUND: {
      code: 'TRANSLATION_TASK_001',
      message: 'Translation task not found',
      httpStatus: 404,
    },
    SAVE_FAILED: {
      code: 'TRANSLATION_TASK_002',
      message: 'Failed to save translation task',
      httpStatus: 500,
    },
    FIND_FAILED: {
      code: 'TRANSLATION_TASK_003',
      message: 'Failed to find translation task(s)',
      httpStatus: 500,
    },
    PARSING_ERROR: {
      code: 'TRANSLATION_TASK_004',
      message: 'Failed to parse email content',
      httpStatus: 500,
    },
    CREATION_FAILED: {
      code: 'TRANSLATION_TASK_005',
      message: 'Failed to create translation task',
      httpStatus: 500,
    },
    MISSING_SOURCE_CONTENT: {
      code: 'TRANSLATION_TASK_006',
      message: 'Missing source content for translation task',
      httpStatus: 400,
    },
    ALREADY_ASSIGNED: {
      code: 'TRANSLATION_TASK_007',
      message: 'Translation task is already assigned to an editor',
      httpStatus: 409,
    },
    NOT_ASSIGNED_TO_EDITOR: {
      code: 'TRANSLATION_TASK_008',
      message:
        'Translation task is not assigned to this editor or does not require editor completion',
      httpStatus: 403,
    },
    NOT_ASSIGNED: {
      code: 'TRANSLATION_TASK_011',
      message: 'Translation task is not assigned to this editor',
      httpStatus: 403,
    },
    VALIDATION_FAILED: {
      code: 'TRANSLATION_TASK_012',
      message: 'Validation of edited content failed',
      httpStatus: 400,
    },
    INVALID_STATUS_FOR_ASSIGNMENT: {
      code: 'TRANSLATION_TASK_009',
      message:
        'Translation task cannot be assigned in its current status or does not require an editor',
      httpStatus: 400,
    },
    INVALID_STATUS_FOR_COMPLETION: {
      code: 'TRANSLATION_TASK_010',
      message:
        'Translation task cannot be completed by an editor in its current status or was not assigned to one',
      httpStatus: 400,
    },
    INVALID_STATUS: {
      code: 'TRANSLATION_TASK_011',
      message: 'Task cannot be processed with its current status',
      httpStatus: 400,
    },
    EMPTY_CONTENT: {
      code: 'TRANSLATION_TASK_012',
      message: 'Task has no content to parse',
      httpStatus: 400,
    },
    UNSUPPORTED_TYPE: {
      code: 'TRANSLATION_TASK_013',
      message: 'Unsupported task type',
      httpStatus: 400,
    },
    HTML_VALIDATION_FAILED: {
      code: 'TRANSLATION_TASK_014',
      message: 'HTML validation failed',
      httpStatus: 400,
    },
    HTML_PARSING_FAILED: {
      code: 'TRANSLATION_TASK_015',
      message: 'HTML parsing failed',
      httpStatus: 400,
    },
    EDITOR_NOT_ASSIGNED: {
      code: 'TRANSLATION_TASK_015',
      message: 'Editor ID must be set before starting editing',
      httpStatus: 400,
    },
    MISSING_WORD_COUNT: {
      code: 'TRANSLATION_TASK_016',
      message: 'Word count must be set before marking as parsed',
      httpStatus: 400,
    },
    INVALID_HTML_STRUCTURE: {
      code: 'TRANSLATION_TASK_017',
      message: 'Invalid HTML structure in email content',
      httpStatus: 400,
    },
    NO_TRANSLATABLE_CONTENT: {
      code: 'TRANSLATION_TASK_018',
      message: 'No translatable content found in email',
      httpStatus: 400,
    },
    CONTENT_SIZE_EXCEEDED: {
      code: 'TRANSLATION_TASK_017',
      message: 'Email content exceeds maximum allowed size',
      httpStatus: 400,
    },
    HTML_EXTRACTION_FAILED: {
      code: 'TRANSLATION_TASK_018',
      message: 'Could not extract HTML content from email',
      httpStatus: 400,
    },
    INVALID_STATUS_TRANSITION: {
      code: 'TRANSLATION_TASK_019',
      message: 'Invalid translation task status transition',
      httpStatus: 400,
    },
    UNSUPPORTED_FORMAT: {
      code: 'TRANSLATION_TASK_020',
      message: 'Unsupported text format',
      httpStatus: 400,
    },
    INVALID_LANGUAGE_CODES: {
      code: 'TRANSLATION_TASK_021',
      message: 'Invalid or unsupported language codes',
      httpStatus: 400,
    },
    CALLBACK_URL_INVALID: {
      code: 'TRANSLATION_TASK_022',
      message: 'Provided callback URL is invalid',
      httpStatus: 400,
    },
  },
  EVALUATION: {
    INVALID_STATE: {
      code: 'EVALUATION_001',
      message: 'Invalid state transition',
      httpStatus: 400,
    },
    INVALID_GRADE: {
      code: 'EVALUATION_002',
      message: 'Invalid grade',
      httpStatus: 400,
    },
    TASK_MUST_BE_SUBMITTED: {
      code: 'EVALUATION_003',
      message: 'Task must be submitted before grading',
      httpStatus: 400,
    },
    INVALID_RATING: {
      code: 'EVALUATION_004',
      message: 'Average rating must be between 1 and 5',
      httpStatus: 400,
    },
    EDITOR_NOT_ELIGIBLE_FOR_EVALUATION: {
      code: 'EVALUATION_005',
      message: 'Editor is not eligible for evaluation in this language pair',
      httpStatus: 400,
    },
    NOT_QUALIFIED_FOR_LANGUAGE_PAIR: {
      code: 'EVALUATION_006',
      message: 'Senior editor is not qualified for this language pair',
      httpStatus: 403,
    },
    ALREADY_ASSIGNED: {
      code: 'EVALUATION_007',
      message: 'Evaluation set is already assigned to a reviewer',
      httpStatus: 409,
    },
    NOT_FOUND: {
      code: 'EVALUATION_008',
      message: 'Evaluation set not found',
      httpStatus: 404,
    },
    NOT_AUTHORIZED: {
      code: 'EVALUATION_010',
      message: 'Not authorized to access this evaluation',
      httpStatus: 403,
    },
    EVALUATION_ALREADY_STARTED: {
      code: 'EVALUATION_009',
      message: 'Evaluation set already started',
      httpStatus: 409,
    },
    TASK_NOT_FOUND: {
      code: 'EVALUATION_011',
      message: 'Evaluation task not found',
      httpStatus: 404,
    },
    TASK_ALREADY_RATED: {
      code: 'EVALUATION_012',
      message: 'Evaluation task has already been rated',
      httpStatus: 400,
    },
    INVALID_STATUS: {
      code: 'EVALUATION_013',
      message: 'Evaluation set is not in the correct status',
      httpStatus: 400,
    },
    INVALID_FEEDBACK: {
      code: 'EVALUATION_014',
      message: 'Feedback is required for rating evaluation tasks',
      httpStatus: 400,
    },
  },
  COMMON: {
    INVALID_STATE: {
      code: 'COMMON_001',
      message: 'Invalid state transition',
      httpStatus: 400,
    },
  },
} as const;
