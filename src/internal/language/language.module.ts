import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LanguageMapper, LanguageRepository } from './infrastructure';

@Module({
  imports: [CqrsModule],
  providers: [LanguageRepository, LanguageMapper],
  exports: [LanguageRepository],
})
export class LanguageModule {}
