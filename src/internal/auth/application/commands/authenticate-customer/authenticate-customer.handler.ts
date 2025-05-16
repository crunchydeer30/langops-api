import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AuthenticateCustomerCommand } from './authenticate-customer.command';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, UserRole } from '../../interfaces/jwt-payload.interface';
import { Email } from '@common/domain/value-objects';
import { CustomerRepository } from 'src/internal/customer/infrastructure/repositories/customer.repository';
import { CustomerLoggedInEvent } from 'src/internal/customer/domain/events';

@CommandHandler(AuthenticateCustomerCommand)
export class AuthenticateCustomerHandler
  implements
    ICommandHandler<AuthenticateCustomerCommand, { accessToken: string }>
{
  private readonly logger = new Logger(AuthenticateCustomerHandler.name);

  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    props,
  }: AuthenticateCustomerCommand): Promise<{ accessToken: string }> {
    this.logger.log(`Authenticating customer: ${props.email}`);
    const { email, password } = props;

    const customer = await this.customerRepository.findByEmail(
      Email.create(email),
    );

    if (!customer) {
      this.logger.warn(
        `Failed to authenticate customer: Customer not found for email ${email}`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await customer.comparePassword(password);

    if (!isPasswordValid) {
      this.logger.warn(
        `Failed to authenticate customer: Invalid password for email ${email}`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }

    this.logger.log(`Issuing access token for customer: ${email}`);
    const payload: JwtPayload = {
      id: customer.id,
      roles: [UserRole.CUSTOMER],
    };

    const accessToken = this.jwtService.sign(payload);

    this.eventBus.publish(
      new CustomerLoggedInEvent({ customerId: customer.id, at: new Date() }),
    );

    this.logger.log(`Successfully issued access token for customer: ${email}`);
    return { accessToken };
  }
}
