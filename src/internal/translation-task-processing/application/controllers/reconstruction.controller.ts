import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure';
import { TranslationTaskSegmentRepository } from '../../infrastructure/repositories/translation-task-segment.repository';
import { EmailProcessingService } from '../services/email-processing.service';

@Controller('translation-task-parsing')
export class ReconstructionController {
  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly segmentRepository: TranslationTaskSegmentRepository,
    private readonly emailProcessingService: EmailProcessingService,
  ) {}

  @Get('reconstruct')
  async reconstruct(@Query('taskId') taskId: string) {
    const task = await this.translationTaskRepository.findById(taskId);
    if (!task || !task.templatedContent) {
      throw new NotFoundException(`Task ${taskId} or templated content not found`);
    }
    const segments = await this.segmentRepository.findByTranslationTaskId(taskId);
    const content = this.emailProcessingService.reconstructEmail(
      task.templatedContent,
      segments,
      false,
    );
    return { taskId, content };
  }
}
