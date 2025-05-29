import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
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
import {
  GetAvailableTasksQuery,
  IGetAvailableTasksQueryResponse,
} from '../queries/get-available-tasks/get-available-tasks.query';

@ApiTags('translation-tasks')
@Controller(TRANSLATION_TASK_HTTP_CONTROLLER)
export class TranslationTaskController {
  private readonly logger = new Logger(TranslationTaskController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get(TRANSLATION_TASK_HTTP_ROUTES.AVAILABLE)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  @ApiOperation({ summary: 'Get available translation tasks for an editor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available translation tasks retrieved successfully',
    type: [GetAvailableTasksResponseDto],
  })
  async getAvailableTasks(
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<GetAvailableTasksResponseDto> {
    this.logger.log(
      `Editor ${jwtPayload.id} requesting available translation tasks`,
    );

    const result = await this.queryBus.execute<
      GetAvailableTasksQuery,
      IGetAvailableTasksQueryResponse
    >(
      new GetAvailableTasksQuery({
        editorId: jwtPayload.id,
      }),
    );

    this.logger.log(
      `Successfully retrieved available tasks for editor ${jwtPayload.id}`,
    );

    return result;
  }
}
