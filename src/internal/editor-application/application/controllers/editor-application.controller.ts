import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiResponse } from '@nestjs/swagger';
import {
  EDITOR_APPLICATION_HTTP_CONTROLLER,
  EDITOR_APPLICATION_HTTP_ROUTES,
} from '@libs/contracts/editor-application';
import {
  SubmitEditorApplicationBodyDto,
  SubmitEditorApplicationResponseDto,
} from '../../application/dtos/submit-editor-application.dto';
import { SubmitEditorApplicationCommand } from '../../application/commands/submit-editor-application/submit-editor-application.command';
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
}
