import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiResponse } from '@nestjs/swagger';
import { AUTH_HTTP_CONTROLLER, AUTH_HTTP_ROUTES } from '@libs/contracts/auth';
import {
  LoginStaffBodyDto,
  LoginStaffResponseDto,
} from '../dto/login-staff.dto';
import {
  AuthenticateStaffCommand,
  IAuthenticateStaffCommandResult,
} from '../commands/authenticate-staff';
import { Logger } from '@nestjs/common';

@Controller(AUTH_HTTP_CONTROLLER.STAFF)
export class AuthStaffController {
  private readonly logger = new Logger(AuthStaffController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post(AUTH_HTTP_ROUTES.STAFF.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: LoginStaffResponseDto })
  async login(@Body() dto: LoginStaffBodyDto): Promise<LoginStaffResponseDto> {
    this.logger.log(`Processing login request for staff member: ${dto.email}`);
    const { email, password } = dto;

    const result = await this.commandBus.execute<
      AuthenticateStaffCommand,
      IAuthenticateStaffCommandResult
    >(new AuthenticateStaffCommand({ email, password }));

    this.logger.log(
      `Successfully generated access token for staff member: ${email}`,
    );

    return { accessToken: result.accessToken };
  }
}
