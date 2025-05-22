import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AnonymizerHttpAdapter } from './anonymizer.http.adapter';
import { Env } from '@common/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService<Env>) => ({
        baseURL: cs.get<string>('ANONYMIZER_URL'),
        timeout: cs.get<number>('ANONYMIZER_TIMEOUT', 5000),
      }),
    }),
  ],
  providers: [AnonymizerHttpAdapter],
  exports: [AnonymizerHttpAdapter],
})
export class AnonymizerModule {}
