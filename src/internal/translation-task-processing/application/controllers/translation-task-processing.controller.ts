import { Body, Controller, Post, Logger } from '@nestjs/common';
import { TranslationTaskType } from '@prisma/client';
import { StartParsingDto } from '../dtos';
import { TranslationTaskProcessingOrchestrator } from '../flows/translation-task-processing.orchestrator';

@Controller('translation-task-parsing')
export class TranslationTaskProcessingController {
  private readonly logger = new Logger(
    TranslationTaskProcessingController.name,
  );

  constructor(
    private readonly flowOrchestrator: TranslationTaskProcessingOrchestrator,
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
