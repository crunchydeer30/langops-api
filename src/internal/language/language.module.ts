import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LanguageMapper, LanguageRepository } from './infrastructure';
import { LanguagePairRepository } from './infrastructure/repositories';
import { LanguagePairMapper } from './infrastructure/mappers';

@Module({
  imports: [CqrsModule],
  providers: [
    LanguageRepository,
    LanguageMapper,
    LanguagePairMapper,
    LanguagePairRepository,
  ],
  exports: [LanguageRepository, LanguagePairRepository],
})
export class LanguageModule {}
