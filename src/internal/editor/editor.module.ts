import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EditorMapper, EditorRepository } from './infrastructure';
import { LanguagePairModule } from '../language-pair/language-pair.module';

@Module({
  imports: [CqrsModule, LanguagePairModule],
  controllers: [],
  providers: [EditorRepository, EditorMapper],
  exports: [EditorRepository],
})
export class EditorModule {}
