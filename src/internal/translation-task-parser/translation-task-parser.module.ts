import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranslationTaskParsingFlowOrchestrator } from './application/flows/translation-task-parsing-flow.orchestrator';
import { EmailTranslationTaskParsingFlowStrategy } from './application/flows/strategies/email-translation-task-parsing-flow.strategy';
import { EmailTranslationTaskParsingProcessor } from './application/processors/email-translation-task-parsing.processor';
import { EmailParsingController } from './controllers/email-parsing.controller';
import { TranslationTaskParsingController } from './controllers/translation-task-parsing.controller';
import { EmailParsingService } from './application/services/email-parsing.service';
import { TranslationTaskParsingBullMQModule } from './infrastructure/bullmq/translation-task-parsing-bullmq.module';

@Module({
  imports: [CqrsModule, TranslationTaskParsingBullMQModule],
  controllers: [EmailParsingController, TranslationTaskParsingController],
  providers: [
    // Services
    EmailParsingService,

    // Flow components
    TranslationTaskParsingFlowOrchestrator,
    EmailTranslationTaskParsingFlowStrategy,
    EmailTranslationTaskParsingProcessor,
  ],
  exports: [EmailParsingService, TranslationTaskParsingFlowOrchestrator],
})
export class TranslationTaskParserModule {}
