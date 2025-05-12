import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiResponse } from '@nestjs/swagger';
import { AUTH_HTTP_CONTROLLER, AUTH_HTTP_ROUTES } from '@libs/contracts/auth';
import {
  LoginEditorBodyDto,
  LoginEditorResponseDto,
} from '../dto/login-editor.dto';
import { AuthenticateEditorCommand } from '../application/commands/authenticate-editor';
import { Logger } from '@nestjs/common';

@Controller(AUTH_HTTP_CONTROLLER.EDITOR)
export class AuthEditorController {
  private readonly logger = new Logger(AuthEditorController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post(AUTH_HTTP_ROUTES.EDITOR.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: LoginEditorResponseDto })
  async login(
    @Body() dto: LoginEditorBodyDto,
  ): Promise<LoginEditorResponseDto> {
    this.logger.log(`Processing login request for editor: ${dto.email}`);
    const { email, password } = dto;

    const result = await this.commandBus.execute<
      AuthenticateEditorCommand,
      { accessToken: string }
    >(new AuthenticateEditorCommand({ email, password }));

    this.logger.log(`Successfully generated access token for editor: ${email}`);
    return result;
  }
}
