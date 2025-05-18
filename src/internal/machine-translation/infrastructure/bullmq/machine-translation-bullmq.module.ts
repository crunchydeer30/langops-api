import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MACHINE_TRANSLATION_QUEUE } from './constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: MACHINE_TRANSLATION_QUEUE,
    }),
  ],
})
export class MachineTranslationBullMqModule {}
