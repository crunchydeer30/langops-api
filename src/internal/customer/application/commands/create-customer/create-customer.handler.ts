import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { CreateCustomerCommand } from './create-customer.command';
import { Customer } from '../../../domain/entities/customer.entity';
import { Logger } from '@nestjs/common';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts';
import { CustomerRepository } from '../../../infrastructure/repositories/customer.repository';
import { Email } from '@common/domain/value-objects';

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler
  implements ICommandHandler<CreateCustomerCommand>
{
  private readonly logger = new Logger(CreateCustomerHandler.name);

  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute({ props }: CreateCustomerCommand): Promise<Customer> {
    const { email, password, firstName, lastName } = props;
    this.logger.log(
      `Attempting to create customer: ${JSON.stringify({ email, firstName, lastName })}`,
    );

    const existingCustomer = await this.customerRepository.findByEmail(
      Email.create(email),
    );

    if (existingCustomer) {
      this.logger.warn(
        `Failed to create customer: email "${email}" is already in use`,
      );
      throw new DomainException(ERRORS.CUSTOMER.EMAIL_CONFLICT);
    }

    const customer = await Customer.create({
      email,
      password,
      firstName,
      lastName,
    });

    await this.customerRepository.save(customer);
    const customerWithEvents = this.publisher.mergeObjectContext(customer);
    customerWithEvents.commit();

    this.logger.log(
      `Successfully created customer: ${email} with ID ${customer.id}`,
    );

    return customer;
  }
}
