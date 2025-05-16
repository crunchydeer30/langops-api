import { AuthCustomerController } from './auth-customer.controller';
import { AuthStaffController } from './auth-staff.controller';
import { AuthEditorController } from './auth-editor.controller';

export * from './auth-customer.controller';
export * from './auth-staff.controller';
export * from './auth-editor.controller';

export const AuthControllers = [
  AuthCustomerController,
  AuthStaffController,
  AuthEditorController,
];
