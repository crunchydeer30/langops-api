import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LanguagePairMapper, LanguagePairRepository } from './infrastructure';

@Module({
  imports: [CqrsModule],
  providers: [LanguagePairRepository, LanguagePairMapper],
  exports: [LanguagePairRepository],
})
export class LanguagePairModule {}
