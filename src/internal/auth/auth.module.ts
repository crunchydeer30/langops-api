import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';
import { Env } from 'src/common/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { AUTH_COMMAND_HANDLERS } from './application';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<Env>) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
    CqrsModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...AUTH_COMMAND_HANDLERS],
})
export class AuthModule {}
