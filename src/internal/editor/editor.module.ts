import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EditorMapper, EditorRepository } from './infrastructure';
import { LanguageModule } from '../language/language.module';

@Module({
  imports: [CqrsModule, LanguageModule],
  controllers: [],
  providers: [EditorRepository, EditorMapper],
  exports: [EditorRepository],
})
export class EditorModule {}
