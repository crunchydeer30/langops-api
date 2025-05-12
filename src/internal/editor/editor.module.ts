import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EditorMapper, EditorRepository } from './infrastructure';

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [EditorRepository, EditorMapper],
  exports: [EditorRepository],
})
export class EditorModule {}
