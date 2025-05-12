import { AuthenticateCustomerHandler } from './authenticate-customer';
import { AuthenticateStaffHandler } from './authenticate-staff';
import { AuthenticateEditorHandler } from './authenticate-editor';

export * from './authenticate-customer';
export * from './authenticate-staff';
export * from './authenticate-editor';

export const AuthCommandHandlers = [
  AuthenticateCustomerHandler,
  AuthenticateStaffHandler,
  AuthenticateEditorHandler,
];
