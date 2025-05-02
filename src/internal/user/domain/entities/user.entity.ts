import { AggregateRoot } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { Email } from '../value-objects/email.vo';
import { VerificationToken } from '../value-objects/verification-token.vo';
import { UserRole } from './user-role.enum';
import {
  UserEmailVerifiedEvent,
  UserRegisteredEvent,
  UserPasswordChangedEvent,
  UserEmailVerificationTokenGeneratedEvent,
  UserPasswordResetRequestedEvent,
  UserPasswordResetEvent,
} from '../events';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts';

export type UserEssentialProperties = Readonly<{
  id: string;
  email: Email;
  passwordHash: string;
  roles: UserRole[];
  firstName: string;
  lastName: string;
}>;

export type UserOptionalProperties = Readonly<
  Partial<{
    emailVerified: boolean;
    emailVerificationToken: VerificationToken | null;
    passwordResetToken: VerificationToken | null;
    createdAt: Date;
    updatedAt: Date;
  }>
>;

export type IUser = UserEssentialProperties & Required<UserOptionalProperties>;

export class User extends AggregateRoot {
  readonly id: string;
  readonly email: Email;
  private passwordHash: string;
  readonly firstName: string;
  readonly lastName: string;

  emailVerified: boolean;
  public emailVerificationToken: VerificationToken | null;
  public passwordResetToken: VerificationToken | null;
  roles: UserRole[];

  createdAt: Date;
  updatedAt: Date;

  private constructor(properties: IUser) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: IUser): User {
    return new User(properties);
  }

  public static async create(args: {
    id?: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roles?: UserRole[];
  }): Promise<User> {
    const id = args.id ?? uuidv4();
    const emailVo = Email.create(args.email);
    const passwordHash = await argon2.hash(args.password);
    const now = new Date();

    const userProps: IUser = {
      id,
      email: emailVo,
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      roles: args.roles || [],
      emailVerified: false,
      emailVerificationToken: null,
      passwordResetToken: null,
      createdAt: now,
      updatedAt: now,
    };

    const user = new User(userProps);
    user.apply(new UserRegisteredEvent({ userId: id }));
    user.generateEmailVerificationToken();
    return user;
  }

  public async changePassword(password: string): Promise<void> {
    this.passwordHash = await argon2.hash(password);
    this.apply(
      new UserPasswordChangedEvent({ userId: this.id, at: new Date() }),
    );
  }

  public async verifyPassword(password: string): Promise<boolean> {
    return argon2.verify(this.passwordHash, password);
  }

  public async comparePassword(plainPassword: string): Promise<boolean> {
    return argon2.verify(this.passwordHash, plainPassword);
  }

  public generateEmailVerificationToken(): string {
    const vo = VerificationToken.create();
    this.emailVerificationToken = vo;
    this.apply(
      new UserEmailVerificationTokenGeneratedEvent({
        userId: this.id,
        token: vo.value,
        at: new Date(),
      }),
    );
    return vo.value;
  }

  public generatePasswordResetToken(): string {
    const vo = VerificationToken.create();
    this.passwordResetToken = vo;
    this.apply(
      new UserPasswordResetRequestedEvent({
        userId: this.id,
        token: vo.value,
        at: new Date(),
      }),
    );
    return vo.value;
  }

  public verifyEmail(token: string): void {
    if (this.emailVerified) {
      throw new DomainException(ERRORS.USER.EMAIL_ALREADY_VERIFIED);
    }
    if (
      !this.emailVerificationToken ||
      !this.emailVerificationToken.verify(token)
    ) {
      throw new DomainException(ERRORS.USER.EMAIL_VERIFICATION_TOKEN_INVALID);
    }
    this.emailVerified = true;
    this.emailVerificationToken = null;
    this.apply(new UserEmailVerifiedEvent({ userId: this.id, at: new Date() }));
  }

  public async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    if (!this.passwordResetToken || !this.passwordResetToken.verify(token)) {
      throw new DomainException(ERRORS.USER.RESET_PASSWORD_TOKEN_INVALID);
    }

    await this.changePassword(newPassword);
    this.passwordResetToken = null;
    this.apply(new UserPasswordResetEvent({ userId: this.id, at: new Date() }));
  }

  public getPasswordHash(): string {
    return this.passwordHash;
  }
}
