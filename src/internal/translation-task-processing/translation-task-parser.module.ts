import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranslationTaskModule } from '../translation-task/translation.module';
import { EmailProcessingService } from './application/services/email-processing.service';
import { TranslationTaskProcessingBullMQModule } from './infrastructure/bullmq/translation-task-processing-bullmq.module';
import { TranslationTaskProcessingController } from './application/controllers/translation-task-processing.controller';
import { TranslationTaskValidationService } from './application/services/translation-task-validation.service';
import { EmailProcessingFlowStrategy } from './application/flows';
import { EmailTranslationTaskProcessor } from './application/processors';
import { TranslationTaskProcessingOrchestrator } from './application/flows/translation-task-processing.orchestrator';
import { TranslationTaskProcessingOrchestratorProcessor } from './application/processors/translation-task-orchestrator.processor';
import { TranslationTaskSegmentMapper } from './infrastructure/mappers/translation-task-segment.mapper';
import { TranslationTaskSegmentRepository } from './infrastructure/repositories/translation-task-segment.repository';

@Module({
  imports: [
    CqrsModule,
    TranslationTaskProcessingBullMQModule,
    TranslationTaskModule,
  ],
  controllers: [TranslationTaskProcessingController],
  providers: [
    // Services
    EmailProcessingService,
    TranslationTaskValidationService,

    // Flow components
    EmailProcessingFlowStrategy,
    EmailTranslationTaskProcessor,
    TranslationTaskProcessingOrchestrator,
    TranslationTaskProcessingOrchestratorProcessor,

    TranslationTaskSegmentMapper,
    TranslationTaskSegmentRepository,
  ],
  exports: [
    EmailProcessingService,
    TranslationTaskSegmentRepository,
    TranslationTaskProcessingOrchestrator,
  ],
})
export class TranslationTaskProcessingModule {}
