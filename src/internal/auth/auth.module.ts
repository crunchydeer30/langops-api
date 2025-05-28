import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';
import { Env } from 'src/common/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { AuthCommandHandlers } from './application';
import { CustomerModule } from '../customer/customer.module';
import { AuthControllers } from './application/controllers';
import { StaffModule } from '../staff/staff.module';
import { EditorModule } from '../editor/editor.module';
import { EditorApplicationModule } from '../editor-application/editor-application.module';
import { LanguageModule } from '../language/language.module';

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
    EditorModule,
    EditorApplicationModule,
    StaffModule,
    LanguageModule,
  ],
  controllers: [...AuthControllers],
  providers: [AuthService, JwtStrategy, ...AuthCommandHandlers],
})
export class AuthModule {}
