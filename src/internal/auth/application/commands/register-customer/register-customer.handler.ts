import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import {
  RegisterCustomerCommand,
  IRegisterCustomerCommandResult,
} from './register-customer.command';
import { Logger } from '@nestjs/common';
import { Customer } from 'src/internal/customer/domain/entities/customer.entity';
import { CustomerRepository } from 'src/internal/customer/infrastructure/repositories/customer.repository';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  UserRole,
} from 'src/internal/auth/application/interfaces/jwt-payload.interface';

@CommandHandler(RegisterCustomerCommand)
export class RegisterCustomerHandler
  implements ICommandHandler<RegisterCustomerCommand>
{
  private readonly logger = new Logger(RegisterCustomerHandler.name);

  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly jwtService: JwtService,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: RegisterCustomerCommand,
  ): Promise<IRegisterCustomerCommandResult> {
    const { email, password, firstName, lastName } = command.props;

    this.logger.log(`Attempting to register customer with email: ${email}`);

    const customer = await Customer.create({
      email,
      password,
      firstName,
      lastName,
    });

    this.logger.log(
      `Customer entity created with ID: ${customer.id}, email: ${email}`,
    );

    await this.customerRepository.save(customer);

    this.logger.log(
      `Publishing events for new customer with ID: ${customer.id}, email: ${email}`,
    );

    const customerWithEvents = this.publisher.mergeObjectContext(customer);
    customerWithEvents.commit();

    const payload: JwtPayload = {
      id: customer.id,
      roles: [UserRole.CUSTOMER],
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(
      `Successfully registered customer with ID: ${customer.id}, email: ${customer.email.value}`,
    );

    return {
      userId: customer.id,
      accessToken,
    };
  }
}
