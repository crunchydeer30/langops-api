import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@common/config';
import { InternalModule } from './internal/internal.module';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (env) => validateEnv(env),
    }),
    InfrastructureModule,
    IntegrationModule,
    InternalModule,
  ],
})
export class AppModule {}
