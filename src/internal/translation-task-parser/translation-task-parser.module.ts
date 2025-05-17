import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailTranslationTaskParsingFlowStrategy } from './application/flows/strategies/email-translation-task-parsing-flow.strategy';
import { EmailTranslationTaskParsingProcessor } from './application/processors/email-translation-task-parsing.processor';
import { EmailParsingService as EmailParsingOldService } from './application/services/email-parsing-old.service';
import { EmailParsingService } from './application/services/email-parsing.service';
import { TranslationTaskParsingBullMQModule } from './infrastructure/bullmq/translation-task-parsing-bullmq.module';
import { TranslationTaskParsingController } from './application/controllers/translation-task-parsing.controller';
import { EmailParsingController } from './application/controllers/email-parsing.controller';
import { TranslationTaskValidationService } from './application/services/translation-task-validation.service';
import { TranslationTaskModule } from '../translation-task/translation.module';
import { TranslationTaskSegmentMapper } from './infrastructure/mappers/translation-task-segment.mapper';
import { TranslationTaskSegmentRepository } from './infrastructure/repositories/translation-task-segment.repository';
import { TranslationTaskParsingFlowOrchestrator } from './application/flows/translation-task-parsing.orchestrator';
import { TranslationTaskParsingOrchestratorProcessor } from './application/processors/translation-task-parsing.processor';

@Module({
  imports: [
    CqrsModule,
    TranslationTaskParsingBullMQModule,
    TranslationTaskModule,
  ],
  controllers: [EmailParsingController, TranslationTaskParsingController],
  providers: [
    // Services
    EmailParsingOldService,
    EmailParsingService,
    TranslationTaskValidationService,

    // Flow components
    EmailTranslationTaskParsingFlowStrategy,
    EmailTranslationTaskParsingProcessor,
    TranslationTaskParsingFlowOrchestrator,
    TranslationTaskParsingOrchestratorProcessor,

    TranslationTaskSegmentMapper,
    TranslationTaskSegmentRepository,
  ],
  exports: [
    EmailParsingOldService,
    EmailParsingService,
    TranslationTaskParsingFlowOrchestrator,
  ],
})
export class TranslationTaskParserModule {}
