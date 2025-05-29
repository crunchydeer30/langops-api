export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface JwtPayload {
  id: string;
  roles: UserRole[];
}
