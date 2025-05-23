import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranslationController } from './application/controllers';
import { TranslationCommandHandlers } from './application/commands';
import { TranslationQueryHandlers } from './application/queries';
import { LanguageModule } from '../language/language.module';
import { OrderModule } from '../order/order.module';
import { TranslationTaskModule } from '../translation-task/translation-task.module';
import { TranslationTaskProcessingModule } from '../translation-task-processing/translation-task-processing.module';
import { TranslationReadRepository } from './infrastructure';

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
    TranslationReadRepository,
  ],
})
export class TranslationModule {}
