import { Injectable } from '@nestjs/common';
import { ICustomerRepository } from '../../domain/ports/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerMapper } from '../mappers/customer.mapper';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { Email } from '@common/domain/value-objects';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: CustomerMapper,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) return null;
    return this.mapper.toDomain(customer);
  }

  async findByEmail(email: Email): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { email: email.value },
    });
    return this.mapper.toDomain(customer);
  }

  async save(customer: Customer): Promise<void> {
    const persistenceData = this.mapper.toPersistence(customer);
    await this.prisma.customer.upsert({
      where: { id: customer.id },
      create: {
        ...persistenceData,
      },
      update: {
        ...persistenceData,
      },
    });
  }
}
