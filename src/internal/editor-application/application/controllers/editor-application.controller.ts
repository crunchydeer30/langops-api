import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiResponse } from '@nestjs/swagger';
import {
  EDITOR_APPLICATION_HTTP_CONTROLLER,
  EDITOR_APPLICATION_HTTP_ROUTES,
} from '@libs/contracts/editor-application';
import {
  SubmitEditorApplicationBodyDto,
  SubmitEditorApplicationResponseDto,
  ApproveEditorApplicationParamsDto,
  ApproveEditorApplicationResponseDto,
} from '../../application/dtos';
import { SubmitEditorApplicationCommand } from '../../application/commands/submit-editor-application/submit-editor-application.command';
import { ApproveEditorApplicationCommand } from '../../application/commands/approve-editor-application/approve-editor-application.command';
import { JwtAuthGuard } from 'src/internal/auth/application/guards/jwt-auth.guard';
import { RolesGuard } from 'src/internal/auth/application/guards/roles.guard';
import { Roles } from 'src/internal/auth/application/decorators/roles.decorator';
import { UserRole } from 'src/internal/auth/application/interfaces/jwt-payload.interface';
import { EditorApplication } from '../../domain';

@Controller(EDITOR_APPLICATION_HTTP_CONTROLLER)
export class EditorApplicationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(EDITOR_APPLICATION_HTTP_ROUTES.SUBMIT)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ type: SubmitEditorApplicationResponseDto })
  async submitApplication(
    @Body() dto: SubmitEditorApplicationBodyDto,
  ): Promise<SubmitEditorApplicationResponseDto> {
    const applicationId = await this.commandBus.execute<
      SubmitEditorApplicationCommand,
      EditorApplication
    >(
      new SubmitEditorApplicationCommand({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        languagePairIds: dto.languagePairIds,
      }),
    );

    return {
      applicationId: applicationId.id,
      message:
        'Your application has been successfully submitted and will be reviewed shortly.',
    };
  }

  @Post(EDITOR_APPLICATION_HTTP_ROUTES.APPROVE)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiResponse({ type: ApproveEditorApplicationResponseDto })
  async approveApplication(
    @Param() params: ApproveEditorApplicationParamsDto,
  ): Promise<ApproveEditorApplicationResponseDto> {
    const applicationId = await this.commandBus.execute<
      ApproveEditorApplicationCommand,
      string
    >(new ApproveEditorApplicationCommand({ applicationId: params.id }));

    return {
      success: true,
      applicationId,
    };
  }
}
