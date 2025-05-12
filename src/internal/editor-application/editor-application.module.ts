import { Module } from '@nestjs/common';
import { EditorApplicationController } from './application/controllers';
import { EditorApplicationCommandHandlers } from './application/commands';
import {
  EditorApplicationMapper,
  EditorApplicationRepository,
} from './infrastructure';

@Module({
  controllers: [EditorApplicationController],
  providers: [
    EditorApplicationRepository,
    EditorApplicationMapper,
    ...EditorApplicationCommandHandlers,
  ],
  exports: [],
})
export class EditorApplicationModule {}
