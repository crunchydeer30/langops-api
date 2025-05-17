import { Body, Controller, Post, Logger } from '@nestjs/common';
import { TranslationTaskType } from '@prisma/client';
import { StartParsingDto } from '../dtos';
import { TranslationTaskParsingFlowOrchestrator } from '../flows/translation-task-parsing.orchestrator';

@Controller('translation-task-parsing')
export class TranslationTaskParsingController {
  private readonly logger = new Logger(TranslationTaskParsingController.name);

  constructor(
    private readonly flowOrchestrator: TranslationTaskParsingFlowOrchestrator,
  ) {}

  @Post('start')
  async startParsing(@Body() dto: StartParsingDto) {
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

      return {
        success: false,
        taskId: dto.taskId,
        message: `Failed to start parsing flow: ${errorMessage}`,
      };
    }
  }
}
