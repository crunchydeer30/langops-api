import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';
import { Env } from 'src/common/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthCommandHandlers } from './application';
import { CustomerModule } from '../customer/customer.module';
import { AuthCustomerController } from './controllers';

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
    CustomerModule,
  ],
  controllers: [AuthCustomerController],
  providers: [AuthService, JwtStrategy, ...AuthCommandHandlers],
})
export class AuthModule {}
