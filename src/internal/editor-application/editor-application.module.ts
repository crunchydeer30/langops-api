import { Module } from '@nestjs/common';
import { EditorApplicationController } from './application/controllers';
import { EditorApplicationCommandHandlers } from './application/commands';
import {
  EditorApplicationMapper,
  EditorApplicationRepository,
} from './infrastructure';
import { CqrsModule } from '@nestjs/cqrs';
import { LanguageModule } from '../language/language.module';

@Module({
  imports: [CqrsModule, LanguageModule],
  controllers: [EditorApplicationController],
  providers: [
    EditorApplicationRepository,
    EditorApplicationMapper,
    ...EditorApplicationCommandHandlers,
  ],
  exports: [EditorApplicationRepository],
})
export class EditorApplicationModule {}
