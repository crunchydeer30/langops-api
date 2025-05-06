import { AggregateRoot } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts';
import { Email } from '@common/domain/value-objects/email.vo';
import { VerificationToken } from '@common/domain/value-objects/verification-token.vo';
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
    console.log('Created event');
    customer.generateEmailVerificationToken();
    return customer;
  }

  private generateEmailVerificationToken(): void {
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
    if (!this.emailVerificationToken) {
      throw new DomainException(
        ERRORS.CUSTOMER.EMAIL_VERIFICATION_TOKEN_INVALID,
      );
    }
    const isValid = this.emailVerificationToken.compare(tokenValue);
    if (!isValid) {
      throw new DomainException(
        ERRORS.CUSTOMER.EMAIL_VERIFICATION_TOKEN_INVALID,
      );
    }

    if (this.emailVerified) {
      throw new DomainException(ERRORS.CUSTOMER.EMAIL_ALREADY_VERIFIED);
    }

    this.emailVerified = true;
    this.emailVerificationToken = null;
    this.apply(
      new CustomerEmailVerifiedEvent({
        customerId: this.id,
      }),
    );
  }

  public requestPasswordReset(): void {
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
    this.verifyPasswordResetToken(tokenValue);
    this.passwordHash = await argon2.hash(password);
    this.passwordResetToken = null;
    this.apply(new CustomerPasswordResetEvent({ customerId: this.id }));
  }

  private verifyPasswordResetToken(tokenValue: string): void {
    if (!this.passwordResetToken) {
      throw new DomainException(ERRORS.CUSTOMER.RESET_PASSWORD_TOKEN_INVALID);
    }
    const isValid = this.passwordResetToken.compare(tokenValue);
    if (!isValid) {
      throw new DomainException(ERRORS.CUSTOMER.RESET_PASSWORD_TOKEN_INVALID);
    }
  }

  public clearPasswordResetToken(): void {
    this.passwordResetToken = null;
  }
}
