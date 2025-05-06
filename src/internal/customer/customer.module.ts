import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { CustomerMapper } from './infrastructure/mappers/customer.mapper';
import { CustomerRepository } from './infrastructure/repositories/customer.repository';
import { CustomerCommandHandlers } from './application/commands';

@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [CustomerRepository, CustomerMapper, ...CustomerCommandHandlers],
  exports: [CustomerRepository],
})
export class CustomerModule {}
