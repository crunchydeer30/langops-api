import { Customer as CustomerModel } from '@prisma/client';
import { Customer, ICustomer } from '../../domain/entities/customer.entity';
import { Injectable } from '@nestjs/common';
import { Email, VerificationToken } from '@common/domain/value-objects';

@Injectable()
export class CustomerMapper {
  toDomain(model: CustomerModel | null): Customer | null {
    if (!model) return null;

    const customerProps: ICustomer = {
      id: model.id,
      email: Email.create(model.email),
      passwordHash: model.passwordHash,
      firstName: model.firstName,
      lastName: model.lastName,
      emailVerified: model.emailVerified,
      emailVerificationToken: model.emailVerificationTokenHash
        ? new VerificationToken(model.emailVerificationTokenHash)
        : null,
      passwordResetToken: model.passwordResetTokenHash
        ? new VerificationToken(model.passwordResetTokenHash)
        : null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return Customer.reconstitute(customerProps);
  }

  toPersistence(
    customer: Customer,
  ): Omit<CustomerModel, 'createdAt' | 'updatedAt'> {
    return {
      id: customer.id,
      email: customer.email.value,
      passwordHash: customer.passwordHash,
      firstName: customer.firstName,
      lastName: customer.lastName,
      emailVerified: customer.emailVerified,
      emailVerificationTokenHash: customer.emailVerificationToken
        ? customer.emailVerificationToken.hash
        : null,
      passwordResetTokenHash: customer.passwordResetToken
        ? customer.passwordResetToken.hash
        : null,
    };
  }
}
