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
  XliffParsingService,
} from './application/services';
import { TextParsingService } from './application/services/text-parsing.service';
import { TranslationTaskProcessingProcessor } from './application/processors';
import { TranslationTaskProcessingCommandHandlers } from './application/commands';
import { TextParsingController } from './application/controllers/text-parsing.controller';
import { TaskReconstructionController } from './application/controllers/task-reconstruction.controller';

@Module({
  imports: [
    CqrsModule,
    TranslationTaskProcessingBullMQModule,
    AnonymizerModule,
    TranslationTaskModule,
    LanguageModule,
  ],
  controllers: [TextParsingController, TaskReconstructionController],
  providers: [
    ...TranslationTaskProcessingEventHandlers,
    ...TranslationTaskProcessingCommandHandlers,

    TranslationTaskProcessingProcessor,

    HTMLParsingService,
    HTMLValidatorService,
    ContentAnonymizationService,
    XliffParsingService,
    TextParsingService,

    TranslationTaskSegmentMapper,
    TranslationTaskSegmentRepository,
    SensitiveDataMappingMapper,
    SensitiveDataMappingRepository,
  ],
  exports: [HTMLParsingService, TranslationTaskSegmentRepository],
})
export class TranslationTaskProcessingModule {}
