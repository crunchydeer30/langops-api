export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  EDITOR = 'EDITOR',
  SENIOR_EDITOR = 'SENIOR_EDITOR',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface JwtPayload {
  id: string;
  roles: UserRole[];
}
