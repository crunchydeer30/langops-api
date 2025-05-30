import { Controller, Get, Param, UseGuards, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/internal/auth/application/guards/jwt-auth.guard';
import { ReconstructTextTaskCommand } from '../commands/reconstruct-text-task';
import { BaseReconstructTaskResponse } from '../commands/base-reconstruct-task';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Task Reconstruction')
@Controller('task-reconstruction')
export class TaskReconstructionController {
  private readonly logger = new Logger(TaskReconstructionController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Reconstruct a plain text task' })
  @ApiParam({ name: 'taskId', description: 'ID of the translation task' })
  @ApiResponse({
    status: 200,
    description: 'Task reconstructed successfully',
    schema: {
      properties: {
        taskId: { type: 'string' },
        finalContent: { type: 'string' },
      },
    },
  })
  @Get('text/:taskId')
  async reconstructTextTask(
    @Param('taskId') taskId: string,
  ): Promise<BaseReconstructTaskResponse> {
    this.logger.log(`Received request to reconstruct text task: ${taskId}`);

    return this.commandBus.execute(new ReconstructTextTaskCommand(taskId));
  }
}
