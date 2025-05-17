import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranslationTaskParsingFlowOrchestrator } from './application/flows/translation-task-parsing-flow.orchestrator';
import { EmailTranslationTaskParsingFlowStrategy } from './application/flows/strategies/email-translation-task-parsing-flow.strategy';
import { EmailTranslationTaskParsingProcessor } from './application/processors/email-translation-task-parsing.processor';
import { EmailParsingService } from './application/services/email-parsing.service';
import { TranslationTaskParsingBullMQModule } from './infrastructure/bullmq/translation-task-parsing-bullmq.module';
import { TranslationTaskParsingController } from './application/controllers/translation-task-parsing.controller';
import { EmailParsingController } from './application/controllers/email-parsing.controller';
import { TranslationTaskValidationService } from './application/services/translation-task-validation.service';
import { TranslationTaskModule } from '../translation-task/translation.module';

@Module({
  imports: [
    CqrsModule,
    TranslationTaskParsingBullMQModule,
    TranslationTaskModule,
  ],
  controllers: [EmailParsingController, TranslationTaskParsingController],
  providers: [
    // Services
    EmailParsingService,
    TranslationTaskValidationService,

    // Flow components
    TranslationTaskParsingFlowOrchestrator,
    EmailTranslationTaskParsingFlowStrategy,
    EmailTranslationTaskParsingProcessor,
  ],
  exports: [EmailParsingService, TranslationTaskParsingFlowOrchestrator],
})
export class TranslationTaskParserModule {}
