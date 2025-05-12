import { AggregateRoot } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts';
import { Email } from '@common/domain/value-objects/email.vo';
import { VerificationToken } from '@common/domain/value-objects/verification-token.vo';
import { Logger } from '@nestjs/common';
import {
  CustomerRegisteredEvent,
  CustomerEmailVerifiedEvent,
  CustomerPasswordChangedEvent,
  CustomerPasswordResetRequestedEvent,
  CustomerPasswordResetEvent,
  CustomerEmailVerificationTokenGeneratedEvent,
} from '../events';

export interface ICustomer {
  id: string;
  email: Email;
  passwordHash: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  emailVerificationToken: VerificationToken | null;
  passwordResetToken: VerificationToken | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerCreateArgs {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class Customer extends AggregateRoot implements ICustomer {
  private logger = new Logger(Customer.name);

  public id: string;
  public email: Email;
  public passwordHash: string;
  public firstName: string;
  public lastName: string;
  public emailVerified: boolean;
  public emailVerificationToken: VerificationToken | null;
  public passwordResetToken: VerificationToken | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: ICustomer) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: ICustomer): Customer {
    return new Customer(properties);
  }

  public static async create(args: ICustomerCreateArgs): Promise<Customer> {
    const id = args.id ?? uuidv4();
    const emailVo = Email.create(args.email);
    const passwordHash = await argon2.hash(args.password);
    const now = new Date();
    const logger = new Logger(Customer.name);
    logger.log(`Creating new customer with email: ${args.email} and ID: ${id}`);

    const customerProps: ICustomer = {
      id,
      email: emailVo,
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      emailVerified: false,
      emailVerificationToken: null,
      passwordResetToken: null,
      createdAt: now,
      updatedAt: now,
    };

    const customer = new Customer(customerProps);
    customer.apply(
      new CustomerRegisteredEvent({
        customerId: id,
        email: emailVo.value,
        firstName: args.firstName,
        lastName: args.lastName,
      }),
    );
    customer.generateEmailVerificationToken();
    return customer;
  }

  private generateEmailVerificationToken(): void {
    this.logger.log(
      `Generating email verification token for customer: ${this.id}`,
    );
    const { plainToken, verificationToken } = VerificationToken.generate();
    this.emailVerificationToken = verificationToken;
    this.apply(
      new CustomerEmailVerificationTokenGeneratedEvent({
        customerId: this.id,
        plainToken,
      }),
    );
  }

  public async changePassword(password: string): Promise<void> {
    this.logger.log(`Changing password for customer: ${this.id}`);
    this.passwordHash = await argon2.hash(password);
    this.apply(
      new CustomerPasswordChangedEvent({
        customerId: this.id,
        at: this.updatedAt,
      }),
    );
  }

  public async comparePassword(password: string): Promise<boolean> {
    try {
      return await argon2.verify(this.passwordHash, password);
    } catch {
      return false;
    }
  }

  public verifyEmail(tokenValue: string): void {
    this.logger.log(`Attempting to verify email for customer: ${this.id}`);

    if (!this.emailVerificationToken) {
      this.logger.warn(
        `Email verification failed for customer ${this.id}: No verification token exists`,
      );
      throw new DomainException(
        ERRORS.CUSTOMER.EMAIL_VERIFICATION_TOKEN_INVALID,
      );
    }

    const isValid = this.emailVerificationToken.compare(tokenValue);
    if (!isValid) {
      this.logger.warn(
        `Email verification failed for customer ${this.id}: Invalid token provided`,
      );
      throw new DomainException(
        ERRORS.CUSTOMER.EMAIL_VERIFICATION_TOKEN_INVALID,
      );
    }

    if (this.emailVerified) {
      this.logger.warn(
        `Email verification failed for customer ${this.id}: Email already verified`,
      );
      throw new DomainException(ERRORS.CUSTOMER.EMAIL_ALREADY_VERIFIED);
    }

    this.logger.log(`Email verification successful for customer: ${this.id}`);

    this.emailVerified = true;
    this.emailVerificationToken = null;
    this.apply(
      new CustomerEmailVerifiedEvent({
        customerId: this.id,
      }),
    );
  }

  public requestPasswordReset(): void {
    this.logger.log(`Password reset requested for customer: ${this.id}`);
    const { plainToken, verificationToken } = VerificationToken.generate();
    this.passwordResetToken = verificationToken;
    this.updatedAt = new Date();
    this.apply(
      new CustomerPasswordResetRequestedEvent({
        customerId: this.id,
        plainToken: plainToken,
      }),
    );
  }

  public async resetPassword(
    password: string,
    tokenValue: string,
  ): Promise<void> {
    this.logger.log(`Attempting to reset password for customer: ${this.id}`);
    this.verifyPasswordResetToken(tokenValue);
    this.passwordHash = await argon2.hash(password);
    this.passwordResetToken = null;
    this.logger.log(`Password reset successfully for customer: ${this.id}`);
    this.apply(new CustomerPasswordResetEvent({ customerId: this.id }));
  }

  private verifyPasswordResetToken(tokenValue: string): void {
    if (!this.passwordResetToken) {
      this.logger.warn(
        `Password reset token validation failed for customer ${this.id}: No token exists`,
      );
      throw new DomainException(ERRORS.CUSTOMER.RESET_PASSWORD_TOKEN_INVALID);
    }
    const isValid = this.passwordResetToken.compare(tokenValue);
    if (!isValid) {
      this.logger.warn(
        `Password reset token validation failed for customer ${this.id}: Invalid token provided`,
      );
      throw new DomainException(ERRORS.CUSTOMER.RESET_PASSWORD_TOKEN_INVALID);
    }
    this.logger.log(
      `Password reset token validated successfully for customer: ${this.id}`,
    );
  }

  public clearPasswordResetToken(): void {
    this.passwordResetToken = null;
  }
}
