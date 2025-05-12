import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common/errors/errors';
import { EditorRole } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { Email } from '@common/domain/value-objects/email.vo';
import { VerificationToken } from '@common/domain/value-objects/verification-token.vo';
import {
  EditorRegisteredEvent,
  EditorPasswordChangedEvent,
  EditorPasswordResetRequestedEvent,
  EditorPasswordResetEvent,
} from '../events';

export interface IEditor {
  id: string;
  email: Email;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: EditorRole;
  passwordResetToken: VerificationToken | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEditorCreateArgs {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: EditorRole;
}

export class Editor extends AggregateRoot implements IEditor {
  private logger = new Logger(Editor.name);

  public id: string;
  public email: Email;
  public passwordHash: string;
  public firstName: string;
  public lastName: string;
  public role: EditorRole;
  public passwordResetToken: VerificationToken | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: IEditor) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: IEditor): Editor {
    return new Editor(properties);
  }

  public static async create(args: IEditorCreateArgs): Promise<Editor> {
    const id = args.id ?? uuidv4();
    const emailVo = Email.create(args.email);
    const passwordHash = await argon2.hash(args.password);
    const now = new Date();
    const logger = new Logger(Editor.name);
    logger.log(
      `Creating new editor with email: ${args.email}, ID: ${id}, role: ${args.role ?? EditorRole.REGULAR}`,
    );

    const editorProps: IEditor = {
      id,
      email: emailVo,
      passwordHash,
      passwordResetToken: null,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role ?? EditorRole.REGULAR,
      createdAt: now,
      updatedAt: now,
    };

    const editor = new Editor(editorProps);
    editor.apply(
      new EditorRegisteredEvent({
        editorId: id,
        email: emailVo.value,
        firstName: args.firstName,
        lastName: args.lastName,
      }),
    );
    return editor;
  }

  public async changePassword(password: string): Promise<void> {
    this.logger.log(`Changing password for editor: ${this.id}`);
    this.passwordHash = await argon2.hash(password);
    this.updatedAt = new Date();
    this.apply(
      new EditorPasswordChangedEvent({
        editorId: this.id,
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

  public requestPasswordReset(): void {
    this.logger.log(`Password reset requested for editor: ${this.id}`);
    const { plainToken, verificationToken } = VerificationToken.generate();
    this.passwordResetToken = verificationToken;
    this.updatedAt = new Date();
    this.apply(
      new EditorPasswordResetRequestedEvent({
        editorId: this.id,
        token: plainToken,
      }),
    );
  }

  public async resetPassword(
    password: string,
    tokenValue: string,
  ): Promise<void> {
    this.logger.log(`Attempting to reset password for editor: ${this.id}`);
    this.verifyPasswordResetToken(tokenValue);
    this.passwordHash = await argon2.hash(password);
    this.passwordResetToken = null;
    this.updatedAt = new Date();
    this.logger.log(`Password reset successfully for editor: ${this.id}`);
    this.apply(new EditorPasswordResetEvent({ editorId: this.id }));
  }

  private verifyPasswordResetToken(tokenValue: string): void {
    if (!this.passwordResetToken) {
      this.logger.warn(
        `Password reset token validation failed for editor ${this.id}: No token exists`,
      );
      throw new DomainException(ERRORS.EDITOR.RESET_PASSWORD_TOKEN_INVALID);
    }
    const isValid = this.passwordResetToken.compare(tokenValue);
    if (!isValid) {
      this.logger.warn(
        `Password reset token validation failed for editor ${this.id}: Invalid token provided`,
      );
      throw new DomainException(ERRORS.EDITOR.RESET_PASSWORD_TOKEN_INVALID);
    }
    this.logger.log(
      `Password reset token validated successfully for editor: ${this.id}`,
    );
  }

  public clearPasswordResetToken(): void {
    this.passwordResetToken = null;
    this.updatedAt = new Date();
  }
}
