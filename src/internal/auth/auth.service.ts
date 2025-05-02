import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from '../user/domain/entities/user-role.enum';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwt(data: { id: string; email: string; roles: UserRole[] }): string {
    const payload: JwtPayload = {
      sub: data.id,
      email: data.email,
      roles: data.roles,
    };
    return this.jwtService.sign(payload);
  }
}
