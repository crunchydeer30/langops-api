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
import {
  GetEvaluationTasksQuery,
  IGetEvaluationTasksQueryResponse,
} from '../queries/get-evaluation-tasks/get-evaluation-tasks.query';
import { Logger } from '@nestjs/common';
import { StartReviewResponseDto } from '../dtos/start-review.dto';
import { GetEvaluationTasksResponseDto } from '../dtos/ge-evaluation-tasks.dto';
import { GetEvaluationTaskDetailsResponseDto } from '../dtos/get-evaluation-task-details.dto';
import {
  RateEvaluationTaskRequestDto,
  RateEvaluationTaskResponseDto,
} from '../dtos/rate-evaluation-task.dto';
import {
  GetEvaluationTaskDetailsQuery,
  IGetEvaluationTaskDetailsQueryResponse,
} from '../queries/get-evaluation-task-details/get-evaluation-task-details.query';
import {
  RateEvaluationTaskCommand,
  IRateEvaluationTaskCommandResponse,
} from '../commands/rate-evaluation-task';

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

  @Get(EVALUATION_HTTP_ROUTES.GET_EVALUATION_TASKS)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary: 'Get evaluation tasks for review by a senior editor',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of evaluation tasks for review',
  })
  async getEvaluationTasks(
    @Param('evaluationId') evaluationId: string,
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<GetEvaluationTasksResponseDto> {
    this.logger.log(
      `Fetching evaluation tasks for evaluation set ${evaluationId} for reviewer ${jwtPayload.id}`,
    );

    const result = await this.queryBus.execute<
      GetEvaluationTasksQuery,
      IGetEvaluationTasksQueryResponse
    >(
      new GetEvaluationTasksQuery({
        evaluationSetId: evaluationId,
        reviewerId: jwtPayload.id,
      }),
    );

    this.logger.log(
      `Successfully fetched ${result.length} evaluation tasks for evaluation set ${evaluationId}`,
    );

    return result;
  }

  @Get(EVALUATION_HTTP_ROUTES.GET_EVALUATION_TASK_DETAILS)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary: 'Get evaluation task details for review by a senior editor',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetEvaluationTaskDetailsResponseDto,
    description: 'Evaluation task details including segments',
  })
  async getEvaluationTaskDetails(
    @Param('evaluationId') evaluationId: string,
    @Param('taskId') taskId: string,
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<GetEvaluationTaskDetailsResponseDto> {
    this.logger.log(
      `Fetching evaluation task details for task ${taskId} in evaluation set ${evaluationId} for reviewer ${jwtPayload.id}`,
    );

    const result = await this.queryBus.execute<
      GetEvaluationTaskDetailsQuery,
      IGetEvaluationTaskDetailsQueryResponse
    >(
      new GetEvaluationTaskDetailsQuery({
        evaluationSetId: evaluationId,
        taskId: taskId,
        reviewerId: jwtPayload.id,
      }),
    );

    this.logger.log(
      `Successfully fetched details for evaluation task ${taskId} with ${result.segments.length} segments`,
    );

    return result;
  }

  @Post(EVALUATION_HTTP_ROUTES.RATE_TASK(':evaluationId', ':taskId'))
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary: 'Rate an evaluation task by a senior editor',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RateEvaluationTaskResponseDto,
    description: 'Evaluation task rated successfully',
  })
  async rateEvaluationTask(
    @Param('evaluationId') evaluationId: string,
    @Param('taskId') taskId: string,
    @Body() dto: RateEvaluationTaskRequestDto,
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<RateEvaluationTaskResponseDto> {
    this.logger.log(
      `Senior editor ${jwtPayload.id} evaluating task ${taskId} in evaluation set ${evaluationId} with rating ${dto.rating}`,
    );

    try {
      const result = await this.commandBus.execute<
        RateEvaluationTaskCommand,
        IRateEvaluationTaskCommandResponse
      >(
        new RateEvaluationTaskCommand({
          evaluationSetId: evaluationId,
          taskId: taskId,
          rating: dto.rating,
          feedback: dto.feedback,
          evaluatorId: jwtPayload.id,
        }),
      );

      this.logger.log(
        `Successfully evaluated task ${taskId} with rating ${dto.rating}`,
      );

      return result;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error evaluating task: ${err.message}`, err.stack);
      throw error;
    }
  }
}
