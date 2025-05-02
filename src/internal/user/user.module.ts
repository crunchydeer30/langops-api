import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import {
  UserMapper,
  UserQueryRepository,
  UserRepository,
} from './infrastructure';
import { USER_QUERY_HANDLERS } from './application/queries';
import { USER_COMMAND_HANDLERS } from './application/commands';

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [UserController],
  providers: [
    UserRepository,
    UserQueryRepository,
    UserMapper,
    ...USER_QUERY_HANDLERS,
    ...USER_COMMAND_HANDLERS,
  ],
  exports: [UserRepository, UserQueryRepository],
})
export class UserModule {}
