export enum UserRole {
  CUSTOMER = 'customer',
  EDITOR = 'editor',
  SENIOR_EDITOR = 'senior-editor',
  ADMIN = 'admin',
  STAFF = 'staff',
}

export interface JwtPayload {
  id: string;
  roles: UserRole[];
}
