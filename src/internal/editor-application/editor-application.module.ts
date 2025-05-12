import { Module } from '@nestjs/common';
import { EditorApplicationController } from './application/controllers';
import { EditorApplicationCommandHandlers } from './application/commands';
import {
  EditorApplicationMapper,
  EditorApplicationRepository,
} from './infrastructure';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  controllers: [EditorApplicationController],
  providers: [
    EditorApplicationRepository,
    EditorApplicationMapper,
    ...EditorApplicationCommandHandlers,
  ],
  exports: [EditorApplicationRepository],
})
export class EditorApplicationModule {}
