import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EditorMapper, EditorRepository } from './infrastructure';
import { LanguageModule } from '../language/language.module';
import { EditorLanguagePairMapper } from './infrastructure/mappers/editor-language-pair.mapper';
import { EditorLanguagePairRepository } from './infrastructure/repositories/editor-language-pair.repository';

@Module({
  imports: [CqrsModule, LanguageModule],
  controllers: [],
  providers: [
    EditorRepository,
    EditorMapper,
    EditorLanguagePairMapper,
    EditorLanguagePairRepository,
  ],
  exports: [EditorRepository, EditorLanguagePairRepository],
})
export class EditorModule {}
