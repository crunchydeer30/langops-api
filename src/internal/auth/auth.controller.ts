import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthenticateUserCommand } from './application/commands/authenticate-user/authenticate-user.command';
import { RegisterUserCommand } from '../user/application/commands/register-user/register-user.command';
import { AuthService } from './auth.service';
import { UserRole } from '../user/domain/entities/user-role.enum';
import {
  TokenResponseDto,
  RegisterDto,
  LoginBodyDto,
  LoginResponseDto,
} from './dto';
import { ApiResponse } from '@nestjs/swagger';
import { AUTH_HTTP_CONTROLLER, AUTH_HTTP_ROUTES } from 'libs/contracts/auth';

@Controller(AUTH_HTTP_CONTROLLER)
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @Post(AUTH_HTTP_ROUTES.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: LoginResponseDto })
  async login(@Body() dto: LoginBodyDto): Promise<LoginResponseDto> {
    const { email, password } = dto;

    return this.commandBus.execute(
      new AuthenticateUserCommand({ email, passwordPlain: password }),
    );
  }

  @Post(AUTH_HTTP_ROUTES.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<TokenResponseDto> {
    const registeredUserDetails: {
      id: string;
      email: string;
      roles: UserRole[];
    } = await this.commandBus.execute(
      new RegisterUserCommand({
        ...dto,
        passwordPlain: dto.password,
        roles: [UserRole.CUSTOMER],
      }),
    );

    const accessToken = this.authService.generateJwt({
      id: registeredUserDetails.id,
      email: registeredUserDetails.email,
      roles: registeredUserDetails.roles,
    });

    return { accessToken };
  }
}
