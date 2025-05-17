import { Body, Controller, Post, Logger } from '@nestjs/common';
import { TranslationTaskType } from '@prisma/client';
import { TranslationTaskParsingFlowOrchestrator } from '../application/flows/translation-task-parsing-flow.orchestrator';
import { StartParsingDto } from '../application/dtos/start-parsing.dto';

@Controller('translation-task-parsing')
export class TranslationTaskParsingController {
  private readonly logger = new Logger(TranslationTaskParsingController.name);

  constructor(
    private readonly flowOrchestrator: TranslationTaskParsingFlowOrchestrator,
  ) {}

  @Post('start')
  async startParsing(@Body() dto: StartParsingDto) {
    this.logger.log(
      `Starting parsing flow for task ${dto.taskId} of type ${dto.taskType}`,
    );

    try {
      const taskType = dto.taskType as TranslationTaskType;

      await this.flowOrchestrator.startParsingFlow(dto.taskId, taskType);

      return {
        success: true,
        taskId: dto.taskId,
        message: `Parsing flow started for task ${dto.taskId}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error starting parsing flow: ${errorMessage}`,
        errorStack,
      );

      return {
        success: false,
        taskId: dto.taskId,
        message: `Failed to start parsing flow: ${errorMessage}`,
      };
    }
  }
}
