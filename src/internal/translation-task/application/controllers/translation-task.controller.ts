import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  TRANSLATION_TASK_HTTP_ROUTES,
  TRANSLATION_TASK_HTTP_CONTROLLER,
} from 'libs/contracts/translation-task/controllers/translation-task.http.routes';
import { GetJWTPayload, Roles } from 'src/internal/auth/application/decorators';
import { JwtAuthGuard, RolesGuard } from 'src/internal/auth/application/guards';
import { JwtPayload, UserRole } from 'src/internal/auth/application/interfaces';
import { Logger } from '@nestjs/common';
import { GetAvailableTasksResponseDto } from '../dtos/get-available-tasks.dto';
import {
  SubmitTranslationTaskRequestDto,
  SubmitTranslationTaskResponseDto,
} from '../dtos/submit-translation-task.dto';
import { GetAvailableEvaluationTasksResponseDto } from '../dtos/get-available-evaluation-tasks.dto';
import {
  PickEvaluationTaskRequestDto,
  PickEvaluationTaskResponseDto,
} from '../dtos/pick-evaluation-task.dto';
import {
  PickTranslationTaskRequestDto,
  PickTranslationTaskResponseDto,
} from '../dtos/pick-translation-task.dto';
import {
  GetAvailableTasksQuery,
  IGetAvailableTasksQueryResponse,
} from '../queries/get-available-tasks/get-available-tasks.query';
import { GetAvailableEvaluationTasksQuery } from '../queries/get-available-evaluation-tasks/get-available-evaluation-tasks.query';
import { IGetAvailableEvaluationTasksQueryResponse } from '../queries/get-available-evaluation-tasks/get-available-evaluation-tasks.query';
import {
  IPickEvaluationTaskResponse,
  PickEvaluationTaskCommand,
} from '../commands/pick-evaluation-task/pick-evaluation-task.command';
import { IPickTranslationTaskResponse } from '../commands/pick-translation-task/pick-translation-task.handler';
import { PickTranslationTaskCommand } from '../commands/pick-translation-task/pick-translation-task.command';
import {
  SubmitTranslationTaskCommand,
  ISubmitTranslationTaskResponse,
} from '../commands/submit-translation-task/submit-translation-task.command';
@ApiTags('translation-tasks')
@Controller(TRANSLATION_TASK_HTTP_CONTROLLER)
export class TranslationTaskController {
  private readonly logger = new Logger(TranslationTaskController.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(`${TRANSLATION_TASK_HTTP_ROUTES.AVAILABLE}/:languagePairId`)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary:
      'Get available translation tasks count for an editor in a specific language pair',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available translation tasks count retrieved successfully',
    type: GetAvailableTasksResponseDto,
  })
  async getAvailableTasks(
    @GetJWTPayload() jwtPayload: JwtPayload,
    @Param('languagePairId') languagePairId: string,
  ): Promise<IGetAvailableTasksQueryResponse> {
    this.logger.log(
      `Editor ${jwtPayload.id} requesting available tasks for language pair ${languagePairId}`,
    );

    const result = await this.queryBus.execute<
      GetAvailableTasksQuery,
      IGetAvailableTasksQueryResponse
    >(
      new GetAvailableTasksQuery({
        editorId: jwtPayload.id,
        languagePairId,
      }),
    );

    this.logger.log(
      `Successfully retrieved available tasks for editor ${jwtPayload.id} in language pair ${languagePairId}`,
    );

    return result;
  }

  @Get(`${TRANSLATION_TASK_HTTP_ROUTES.AVAILABLE_EVALUATIONS}/:languagePairId`)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary:
      'Get available evaluation tasks count for an editor in a specific language pair',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available evaluation tasks count retrieved successfully',
    type: GetAvailableEvaluationTasksResponseDto,
  })
  async getAvailableEvaluationTasks(
    @GetJWTPayload() jwtPayload: JwtPayload,
    @Param('languagePairId') languagePairId: string,
  ): Promise<IGetAvailableEvaluationTasksQueryResponse> {
    this.logger.log(
      `Editor ${jwtPayload.id} requesting available evaluation tasks for language pair ${languagePairId}`,
    );

    const result = await this.queryBus.execute<
      GetAvailableEvaluationTasksQuery,
      IGetAvailableEvaluationTasksQueryResponse
    >(
      new GetAvailableEvaluationTasksQuery({
        editorId: jwtPayload.id,
        languagePairId,
      }),
    );

    this.logger.log(
      `Successfully retrieved available evaluation tasks for editor ${jwtPayload.id} in language pair ${languagePairId}`,
    );

    return result;
  }

  @Post(TRANSLATION_TASK_HTTP_ROUTES.PICK_EVALUATION)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary: 'Pick an available evaluation task for an editor',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Evaluation task assigned successfully',
    type: PickEvaluationTaskResponseDto,
  })
  async pickEvaluationTask(
    @GetJWTPayload() jwtPayload: JwtPayload,
    @Body() dto: PickEvaluationTaskRequestDto,
  ): Promise<PickEvaluationTaskResponseDto> {
    this.logger.log(
      `Editor ${jwtPayload.id} requesting to pick an evaluation task for language pair ${dto.languagePairId}`,
    );

    const result = await this.commandBus.execute<
      PickEvaluationTaskCommand,
      IPickEvaluationTaskResponse
    >(
      new PickEvaluationTaskCommand({
        editorId: jwtPayload.id,
        languagePairId: dto.languagePairId,
      }),
    );

    this.logger.log(
      `Successfully assigned evaluation task ${result.translationTaskId} to editor ${jwtPayload.id}`,
    );

    return result;
  }

  @Post(TRANSLATION_TASK_HTTP_ROUTES.PICK)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary: 'Pick an available translation task for a qualified editor',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Translation task assigned successfully',
    type: PickTranslationTaskResponseDto,
  })
  async pickTranslationTask(
    @GetJWTPayload() jwtPayload: JwtPayload,
    @Body() dto: PickTranslationTaskRequestDto,
  ): Promise<PickTranslationTaskResponseDto> {
    this.logger.log(
      `Editor ${jwtPayload.id} requesting to pick a translation task for language pair ${dto.languagePairId}`,
    );

    const result = await this.commandBus.execute<
      PickTranslationTaskCommand,
      IPickTranslationTaskResponse
    >(
      new PickTranslationTaskCommand({
        editorId: jwtPayload.id,
        languagePairId: dto.languagePairId,
      }),
    );

    this.logger.log(
      `Successfully assigned translation task ${result.translationTaskId} to editor ${jwtPayload.id}`,
    );

    return result;
  }

  @Post(TRANSLATION_TASK_HTTP_ROUTES.SUBMIT)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({
    summary: 'Submit edited content for a translation task',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Translation task submitted successfully',
    type: SubmitTranslationTaskResponseDto,
  })
  async submitTranslationTask(
    @GetJWTPayload() jwtPayload: JwtPayload,
    @Param('taskId') taskId: string,
    @Body() dto: SubmitTranslationTaskRequestDto,
  ): Promise<SubmitTranslationTaskResponseDto> {
    this.logger.log(
      `Editor ${jwtPayload.id} submitting translation task ${taskId} with ${dto.segments.length} segments`,
    );

    const result = await this.commandBus.execute<
      SubmitTranslationTaskCommand,
      ISubmitTranslationTaskResponse
    >(
      new SubmitTranslationTaskCommand({
        editorId: jwtPayload.id,
        taskId,
        segments: dto.segments,
      }),
    );

    this.logger.log(
      `Successfully submitted translation task ${result.translationTaskId}`,
    );

    return result;
  }
}
