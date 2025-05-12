import { AggregateRoot } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common/errors/errors';
import { Email } from '@common/domain/value-objects/email.vo';
import { VerificationToken } from '@common/domain/value-objects/verification-token.vo';
import { StaffRole } from '@prisma/client';
import { Logger } from '@nestjs/common';
import {
  StaffMemberRegisteredEvent,
  StaffMemberPasswordChangedEvent,
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
  private logger = new Logger(StaffMember.name);

  public id: string;
  public email: Email;
  public passwordHash: string;
  public firstName: string;
  public lastName: string;
  public role: StaffRole;
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
    const logger = new Logger(StaffMember.name);
    logger.log(
      `Creating new staff member with email: ${args.email}, ID: ${id}, role: ${args.role}`,
    );

    const staffMemberProps: IStaffMember = {
      id,
      email: emailVo,
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role,
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

    return staffMember;
  }

  public async changePassword(password: string): Promise<void> {
    this.logger.log(`Changing password for staff member: ${this.id}`);
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

  public requestPasswordReset(): string {
    this.logger.log(`Password reset requested for staff member: ${this.id}`);
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
    this.logger.log(
      `Password reset token generated for staff member: ${this.id}`,
    );
    return plainToken;
  }

  public async resetPassword(
    password: string,
    tokenValue: string,
  ): Promise<void> {
    this.logger.log(
      `Attempting to reset password for staff member: ${this.id}`,
    );
    this.verifyPasswordResetToken(tokenValue);
    this.passwordHash = await argon2.hash(password);
    this.passwordResetToken = null;
    this.updatedAt = new Date();
    this.logger.log(`Password reset successfully for staff member: ${this.id}`);
    this.apply(
      new StaffMemberPasswordResetEvent({
        staffMemberId: this.id,
        at: this.updatedAt,
      }),
    );
  }

  private verifyPasswordResetToken(tokenValue: string): void {
    if (!this.passwordResetToken) {
      this.logger.warn(
        `Password reset token validation failed for staff member ${this.id}: No token exists`,
      );
      throw new DomainException(ERRORS.STAFF.RESET_PASSWORD_TOKEN_INVALID);
    }
    const isValid = this.passwordResetToken.compare(tokenValue);
    if (!isValid) {
      this.logger.warn(
        `Password reset token validation failed for staff member ${this.id}: Invalid token provided`,
      );
      throw new DomainException(ERRORS.STAFF.RESET_PASSWORD_TOKEN_INVALID);
    }
    this.logger.log(
      `Password reset token validated successfully for staff member: ${this.id}`,
    );
  }

  public clearPasswordResetToken(): void {
    this.passwordResetToken = null;
    this.updatedAt = new Date();
  }
}
