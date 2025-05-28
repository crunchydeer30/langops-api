import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  EVALUATION_HTTP_CONTROLLER,
  EVALUATION_HTTP_ROUTES,
} from 'libs/contracts/evaluation/controllers';
import {
  InitiateEditorEvaluationBodyDto,
  InitiateEditorEvaluationResponseDto,
} from '../dtos';
import { GetJWTPayload, Roles } from 'src/internal/auth/application/decorators';
import { JwtAuthGuard, RolesGuard } from 'src/internal/auth/application/guards';
import { JwtPayload, UserRole } from 'src/internal/auth/application/interfaces';
import { InitiateEditorEvaluationCommand } from '../commands/initiate-editor-evaluation';
import { Logger } from '@nestjs/common';

@ApiTags('evaluation')
@Controller(EVALUATION_HTTP_CONTROLLER)
export class EvaluationController {
  private readonly logger = new Logger(EvaluationController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post(EVALUATION_HTTP_ROUTES.INITIATE_EVALUATION)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({ summary: 'Initiate an evaluation for an editor' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: InitiateEditorEvaluationResponseDto,
    description: 'Evaluation initiated successfully',
  })
  async initiateEvaluation(
    @Body() dto: InitiateEditorEvaluationBodyDto,
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<InitiateEditorEvaluationResponseDto> {
    this.logger.log(
      `Editor ${jwtPayload.id} initiating evaluation for language pair ${dto.languagePairId}`,
    );

    const result = await this.commandBus.execute<
      InitiateEditorEvaluationCommand,
      InitiateEditorEvaluationResponseDto
    >(
      new InitiateEditorEvaluationCommand({
        editorId: jwtPayload.id,
        languagePairId: dto.languagePairId,
      }),
    );

    this.logger.log(
      `Successfully initiated evaluation ${result.evaluationSetId} for editor ${jwtPayload.id}`,
    );

    return result;
  }
}
