import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  TRANSLATION_TASK_HTTP_CONTROLLER,
  TRANSLATION_TASK_HTTP_ROUTES,
} from 'libs/contracts/translation-task/controllers/translation-task.http.routes';
import { GetJWTPayload, Roles } from 'src/internal/auth/application/decorators';
import { JwtAuthGuard, RolesGuard } from 'src/internal/auth/application/guards';
import { JwtPayload, UserRole } from 'src/internal/auth/application/interfaces';
import { Logger } from '@nestjs/common';
import { GetAvailableTasksResponseDto } from '../dtos/get-available-tasks.dto';
import { GetAvailableEvaluationTasksResponseDto } from '../dtos/get-available-evaluation-tasks.dto';
import {
  GetAvailableTasksQuery,
  IGetAvailableTasksQueryResponse,
} from '../queries/get-available-tasks/get-available-tasks.query';
import { GetAvailableEvaluationTasksQuery } from '../queries/get-available-evaluation-tasks/get-available-evaluation-tasks.query';
import { IGetAvailableEvaluationTasksQueryResponse } from '../queries/get-available-evaluation-tasks/get-available-evaluation-tasks.query';

@ApiTags('translation-tasks')
@Controller(TRANSLATION_TASK_HTTP_CONTROLLER)
export class TranslationTaskController {
  private readonly logger = new Logger(TranslationTaskController.name);

  constructor(private readonly queryBus: QueryBus) {}

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
}
