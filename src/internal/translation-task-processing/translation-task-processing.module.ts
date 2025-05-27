import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranslationTaskModule } from '../translation-task/translation-task.module';
import { TranslationTaskProcessingBullMQModule } from './infrastructure/bullmq/translation-task-processing-bullmq.module';
import { TranslationTaskSegmentMapper } from './infrastructure/mappers/translation-task-segment.mapper';
import { TranslationTaskSegmentRepository } from './infrastructure/repositories/translation-task-segment.repository';
import { SensitiveDataMappingMapper } from './infrastructure/mappers/sensitive-data-mapping.mapper';
import { SensitiveDataMappingRepository } from './infrastructure/repositories/sensitive-data-mapping.repository';
import { AnonymizerModule } from 'src/integration/anonymizer/anonymizer.module';
import { LanguageModule } from '../language/language.module';
import { TranslationTaskProcessingEventHandlers } from './application/event-handlers';
import {
  ContentAnonymizationService,
  HTMLParsingService,
  HTMLValidatorService,
} from './application/services';
import { TranslationTaskProcessingProcessor } from './application/processors';
import { TranslationTaskProcessingCommandHandlers } from './application/commands';

@Module({
  imports: [
    CqrsModule,
    TranslationTaskProcessingBullMQModule,
    AnonymizerModule,
    TranslationTaskModule,
    LanguageModule,
  ],
  providers: [
    ...TranslationTaskProcessingEventHandlers,
    ...TranslationTaskProcessingCommandHandlers,

    TranslationTaskProcessingProcessor,

    HTMLParsingService,
    HTMLValidatorService,
    ContentAnonymizationService,

    TranslationTaskSegmentMapper,
    TranslationTaskSegmentRepository,
    SensitiveDataMappingMapper,
    SensitiveDataMappingRepository,
  ],
  exports: [HTMLParsingService, TranslationTaskSegmentRepository],
})
export class TranslationTaskProcessingModule {}
