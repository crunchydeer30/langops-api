import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AUTH_HTTP_CONTROLLER, AUTH_HTTP_ROUTES } from '@libs/contracts/auth';
import {
  LoginEditorBodyDto,
  LoginEditorResponseDto,
} from '../dto/login-editor.dto';
import {
  RegisterEditorBodyDto,
  RegisterEditorResponseDto,
} from '../dto/register-editor.dto';
import {
  AuthenticateEditorCommand,
  IAuthenticateEditorCommandResult,
} from '../commands/authenticate-editor';
import {
  RegisterEditorCommand,
  IRegisterEditorCommandResult,
} from '../commands/register-editor';
import { Logger } from '@nestjs/common';

@Controller(AUTH_HTTP_CONTROLLER.EDITOR)
export class AuthEditorController {
  private readonly logger = new Logger(AuthEditorController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post(AUTH_HTTP_ROUTES.EDITOR.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login as an editor' })
  @ApiResponse({ type: LoginEditorResponseDto })
  async login(
    @Body() dto: LoginEditorBodyDto,
  ): Promise<LoginEditorResponseDto> {
    this.logger.log(`Processing login request for editor: ${dto.email}`);
    const { email, password } = dto;

    const result = await this.commandBus.execute<
      AuthenticateEditorCommand,
      IAuthenticateEditorCommandResult
    >(new AuthenticateEditorCommand({ email, password }));

    this.logger.log(`Successfully generated access token for editor: ${email}`);
    return { accessToken: result.accessToken };
  }

  @Post(AUTH_HTTP_ROUTES.EDITOR.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new editor from an approved application',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RegisterEditorResponseDto,
    description: 'Editor registered successfully',
  })
  async register(
    @Body() dto: RegisterEditorBodyDto,
  ): Promise<RegisterEditorResponseDto> {
    this.logger.log(
      `Processing editor registration with application ID: ${dto.applicationId}`,
    );

    const result = await this.commandBus.execute<
      RegisterEditorCommand,
      IRegisterEditorCommandResult
    >(
      new RegisterEditorCommand({
        applicationId: dto.applicationId,
        token: dto.token,
        password: dto.password,
      }),
    );

    this.logger.log(
      `Successfully registered editor with ID: ${dto.applicationId}`,
    );

    return {
      userId: result.userId,
      accessToken: result.accessToken,
    };
  }
}
