import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { TranslationTaskRepository } from '../../../translation-task/infrastructure/repositories/translation-task.repository';
import { TranslationTaskSegmentRepository } from '../../infrastructure/repositories/translation-task-segment.repository';

@Injectable()
export class EmailProcessingService {
  private readonly logger = new Logger(EmailProcessingService.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly segmentRepository: TranslationTaskSegmentRepository,
    private readonly eventBus: EventBus,
  ) {}
}
