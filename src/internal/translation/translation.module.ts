import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranslationController } from './application/controllers';
import { TranslationCommandHandlers } from './application/commands';
import { TranslationQueryHandlers } from './application/queries';
import { TranslationCreatedHandler } from './application/events/translation-created';
import { LanguageModule } from '../language/language.module';
import { OrderModule } from '../order/order.module';
import { TranslationTaskModule } from '../translation-task/translation-task.module';
import { TranslationTaskProcessingModule } from '../translation-task-processing/translation-task-processing.module';
import {
  TranslationReadRepository,
  TranslationRepository,
} from './infrastructure';
import { TranslationMapper } from './infrastructure/mappers';

@Module({
  imports: [
    CqrsModule,
    LanguageModule,
    OrderModule,
    TranslationTaskModule,
    TranslationTaskProcessingModule,
  ],
  controllers: [TranslationController],
  providers: [
    ...TranslationCommandHandlers,
    ...TranslationQueryHandlers,
    TranslationCreatedHandler,
    TranslationReadRepository,
    TranslationMapper,
    TranslationRepository,
  ],
})
export class TranslationModule {}
