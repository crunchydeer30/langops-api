import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  UserRole,
} from './application/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwt(data: { id: string; email: string }): string {
    const payload: JwtPayload = {
      id: data.id,
      roles: [UserRole.CUSTOMER],
    };
    return this.jwtService.sign(payload);
  }
}
