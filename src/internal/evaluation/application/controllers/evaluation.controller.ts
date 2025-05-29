import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
import { StartReviewCommand } from '../commands/start-review';
import {
  GetPendingReviewSetsQuery,
  IGetPendingReviewSetsQueryResponse,
} from '../queries/get-pending-review-sets/get-pending-review-sets.query';
import { Logger } from '@nestjs/common';
import { StartReviewResponseDto } from '../dtos/start-review.dto';

@ApiTags('evaluation')
@Controller(EVALUATION_HTTP_CONTROLLER)
export class EvaluationController {
  private readonly logger = new Logger(EvaluationController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @Get(EVALUATION_HTTP_ROUTES.PENDING_REVIEW)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary: 'Get evaluation sets pending review for senior editor',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of evaluation sets pending review',
  })
  async getPendingReviewSets(
    @Query('languagePairId') languagePairId: string,
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<IGetPendingReviewSetsQueryResponse[]> {
    const query = new GetPendingReviewSetsQuery({
      editorId: jwtPayload.id,
      languagePairId,
    });

    return this.queryBus.execute(query);
  }

  @Post(EVALUATION_HTTP_ROUTES.START_REVIEW)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary: 'Start review of an evaluation set by a senior editor',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: StartReviewResponseDto,
    description: 'Review successfully started for the evaluation set',
  })
  async startReview(
    @Param('evaluationId') evaluationId: string,
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<StartReviewResponseDto> {
    this.logger.log(
      `Senior editor ${jwtPayload.id} starting review for evaluation set ${evaluationId}`,
    );

    const result = await this.commandBus.execute<
      StartReviewCommand,
      StartReviewResponseDto
    >(
      new StartReviewCommand({
        evaluationSetId: evaluationId,
        reviewerId: jwtPayload.id,
      }),
    );

    this.logger.log(
      `Successfully started review for evaluation set ${evaluationId} by senior editor ${jwtPayload.id}`,
    );

    return result;
  }
}
