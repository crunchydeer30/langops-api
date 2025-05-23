import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranslationController } from './application/controllers';
import { TranslationCommandHandlers } from './application/commands';
import { LanguageModule } from '../language/language.module';
import { OrderModule } from '../order/order.module';
import { TranslationTaskModule } from '../translation-task/translation.module';
import { TranslationTaskProcessingModule } from '../translation-task-processing/translation-task-processing.module';

@Module({
  imports: [
    CqrsModule,
    LanguageModule,
    OrderModule,
    TranslationTaskModule,
    TranslationTaskProcessingModule,
  ],
  controllers: [TranslationController],
  providers: [...TranslationCommandHandlers],
})
export class TranslationModule {}
