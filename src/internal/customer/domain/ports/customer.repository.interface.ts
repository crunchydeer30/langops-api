import { Email } from '@common/domain/value-objects';
import { Customer } from '../entities/customer.entity';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: Email): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
}

export const ICustomerRepository = Symbol('ICustomerRepository');
