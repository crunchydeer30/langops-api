import { UserRole } from '../../user/domain/entities/user-role.enum'; // Assuming this exists

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}
