import { AggregateRoot } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts';
import { Email } from '@common/domain/value-objects/email.vo';
import { VerificationToken } from '@common/domain/value-objects/verification-token.vo';
import { StaffRole } from '@prisma/client';
import {
  StaffMemberRegisteredEvent,
  StaffMemberEmailVerifiedEvent,
  StaffMemberPasswordChangedEvent,
  StaffMemberEmailVerificationTokenGeneratedEvent,
  StaffMemberPasswordResetRequestedEvent,
  StaffMemberPasswordResetEvent,
} from '../events';

export interface IStaffMember {
  id: string;
  email: Email;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  emailVerified: boolean;
  emailVerificationToken: VerificationToken | null;
  passwordResetToken: VerificationToken | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaffMemberCreateArgs {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
}

export class StaffMember extends AggregateRoot implements IStaffMember {
  public id: string;
  public email: Email;
  public passwordHash: string;
  public firstName: string;
  public lastName: string;
  public role: StaffRole;
  public emailVerified: boolean;
  public emailVerificationToken: VerificationToken | null;
  public passwordResetToken: VerificationToken | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: IStaffMember) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: IStaffMember): StaffMember {
    return new StaffMember(properties);
  }

  public static async create(
    args: IStaffMemberCreateArgs,
  ): Promise<StaffMember> {
    const id = args.id ?? uuidv4();
    const emailVo = Email.create(args.email);
    const passwordHash = await argon2.hash(args.password);
    const now = new Date();

    const staffMemberProps: IStaffMember = {
      id,
      email: emailVo,
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role,
      emailVerified: false,
      emailVerificationToken: null,
      passwordResetToken: null,
      createdAt: now,
      updatedAt: now,
    };

    const staffMember = new StaffMember(staffMemberProps);
    staffMember.apply(
      new StaffMemberRegisteredEvent({
        staffMemberId: id,
        email: emailVo.value,
        firstName: args.firstName,
        lastName: args.lastName,
        role: args.role,
      }),
    );

    staffMember.generateEmailVerificationToken();
    return staffMember;
  }

  private generateEmailVerificationToken(): void {
    const { plainToken, verificationToken } = VerificationToken.generate();
    this.emailVerificationToken = verificationToken;
    this.apply(
      new StaffMemberEmailVerificationTokenGeneratedEvent({
        staffMemberId: this.id,
        plainToken,
      }),
    );
  }

  public async changePassword(password: string): Promise<void> {
    this.passwordHash = await argon2.hash(password);
    this.updatedAt = new Date();
    this.apply(
      new StaffMemberPasswordChangedEvent({
        staffMemberId: this.id,
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
      throw new DomainException(ERRORS.STAFF.EMAIL_VERIFICATION_TOKEN_INVALID);
    }
    const isValid = this.emailVerificationToken.compare(tokenValue);
    if (!isValid) {
      throw new DomainException(ERRORS.STAFF.EMAIL_VERIFICATION_TOKEN_INVALID);
    }

    if (this.emailVerified) {
      throw new DomainException(ERRORS.STAFF.EMAIL_ALREADY_VERIFIED);
    }

    this.emailVerified = true;
    this.emailVerificationToken = null;
    this.updatedAt = new Date();
    this.apply(
      new StaffMemberEmailVerifiedEvent({
        staffMemberId: this.id,
      }),
    );
  }

  public requestPasswordReset(): string {
    const { plainToken, verificationToken } = VerificationToken.generate();
    this.passwordResetToken = verificationToken;
    this.updatedAt = new Date();
    this.apply(
      new StaffMemberPasswordResetRequestedEvent({
        staffMemberId: this.id,
        plainToken,
        at: this.updatedAt,
      }),
    );
    return plainToken;
  }

  public async resetPassword(
    password: string,
    tokenValue: string,
  ): Promise<void> {
    this.verifyPasswordResetToken(tokenValue);
    this.passwordHash = await argon2.hash(password);
    this.passwordResetToken = null;
    this.updatedAt = new Date();
    this.apply(
      new StaffMemberPasswordResetEvent({
        staffMemberId: this.id,
        at: this.updatedAt,
      }),
    );
  }

  private verifyPasswordResetToken(tokenValue: string): void {
    if (!this.passwordResetToken) {
      throw new DomainException(ERRORS.STAFF.RESET_PASSWORD_TOKEN_INVALID);
    }
    const isValid = this.passwordResetToken.compare(tokenValue);
    if (!isValid) {
      throw new DomainException(ERRORS.STAFF.RESET_PASSWORD_TOKEN_INVALID);
    }
  }

  public clearPasswordResetToken(): void {
    this.passwordResetToken = null;
    this.updatedAt = new Date();
  }
}
