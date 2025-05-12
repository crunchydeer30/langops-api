import { AuthenticateCustomerHandler } from './authenticate-customer';
import { AuthenticateStaffHandler } from './authenticate-staff';
import { AuthenticateEditorHandler } from './authenticate-editor';
import { RegisterEditorHandler } from './register-editor';
import { RegisterCustomerHandler } from './register-customer';

export * from './authenticate-customer';
export * from './authenticate-staff';
export * from './authenticate-editor';
export * from './register-editor';
export * from './register-customer';

export const AuthCommandHandlers = [
  AuthenticateCustomerHandler,
  AuthenticateStaffHandler,
  AuthenticateEditorHandler,
  RegisterEditorHandler,
  RegisterCustomerHandler,
];
