import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IAnonymizerClient } from 'src/internal/translation-task-processing/domain/ports/anonymizer.client';
import { AnonymizerHttpAdapter } from './anonymizer.http.adapter';
import { AnonTestController } from './anonymizer-test.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        baseURL: cs.get<string>('ANONYMIZER_URL'),
        timeout: cs.get<number>('ANONYMIZER_TIMEOUT', 5000),
      }),
    }),
  ],
  controllers: [AnonTestController],
  providers: [{ provide: IAnonymizerClient, useClass: AnonymizerHttpAdapter }],
  exports: [IAnonymizerClient],
})
export class AnonymizerModule {}
