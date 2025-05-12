import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { EditorApplicationStatus } from '@prisma/client';
import { Email } from '@common/domain/value-objects/email.vo';
import * as crypto from 'crypto';
import {
  EditorApplicationSubmittedEvent,
  EditorApplicationApprovedEvent,
  EditorApplicationRejectedEvent,
  EditorRegistrationTokenGeneratedEvent,
} from '../events';
import { Logger } from '@nestjs/common';

export interface IEditorApplication {
  id: string;
  email: Email;
  firstName: string;
  lastName: string;
  status: EditorApplicationStatus;
  rejectionReason?: string | null;
  registrationTokenHash?: string | null;
  registrationTokenIsUsed?: boolean | null;
  editorId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEditorApplicationCreateArgs {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  languagePairIds: string[];
}

export class EditorApplication
  extends AggregateRoot
  implements IEditorApplication
{
  private logger = new Logger(EditorApplication.name);

  public id: string;
  public firstName: string;
  public lastName: string;
  public email: Email;
  public status: EditorApplicationStatus;
  public rejectionReason: string | null;
  public registrationTokenHash: string | null;
  public registrationTokenIsUsed: boolean | null;
  public editorId: string | null;
  public createdAt: Date;
  public updatedAt: Date;
  public languagePairIds: string[];

  constructor(properties: IEditorApplication & { languagePairIds?: string[] }) {
    super();
    Object.assign(this, properties);
    this.languagePairIds = properties.languagePairIds || [];
  }

  public static reconstitute(
    properties: IEditorApplication & { languagePairIds: string[] },
  ): EditorApplication {
    return new EditorApplication(properties);
  }

  public static create(args: IEditorApplicationCreateArgs): EditorApplication {
    const id = args.id ?? uuidv4();
    const emailVo = Email.create(args.email);
    const now = new Date();

    const applicationProps: IEditorApplication & { languagePairIds: string[] } =
      {
        id,
        email: emailVo,
        status: EditorApplicationStatus.PENDING_REVIEW,
        rejectionReason: null,
        registrationTokenHash: null,
        registrationTokenIsUsed: null,
        firstName: args.firstName,
        lastName: args.lastName,
        editorId: null,
        createdAt: now,
        updatedAt: now,
        languagePairIds: args.languagePairIds,
      };

    const application = new EditorApplication(applicationProps);
    application.apply(
      new EditorApplicationSubmittedEvent({
        applicationId: id,
        email: args.email,
        languagePairIds: args.languagePairIds,
      }),
    );
    return application;
  }

  public approve(): void {
    if (this.status !== EditorApplicationStatus.PENDING_REVIEW) {
      this.logger.warn(
        `Invalid application transition for application "${this.id}" from ${this.status} to ${EditorApplicationStatus.REGISTRATION_PENDING}`,
      );
      throw new DomainException(
        ERRORS.EDITOR_APPLICATION.INVALID_STATUS_TRANSITION,
      );
    }

    this.status = EditorApplicationStatus.REGISTRATION_PENDING;
    this.updatedAt = new Date();
    const { plainToken } = this.generateRegistrationToken();
    this.apply(
      new EditorApplicationApprovedEvent({
        applicationId: this.id,
        email: this.email.value,
        plainToken,
      }),
    );
  }

  public reject(reason: string): void {
    if (this.status !== EditorApplicationStatus.PENDING_REVIEW) {
      this.logger.warn(
        `Invalid application transition for application "${this.id}" from ${this.status} to ${EditorApplicationStatus.REJECTED}`,
      );
      throw new DomainException(
        ERRORS.EDITOR_APPLICATION.INVALID_STATUS_TRANSITION,
      );
    }

    this.status = EditorApplicationStatus.REJECTED;
    this.rejectionReason = reason;
    this.updatedAt = new Date();
    this.logger.log(`Application "${this.id}" rejected with reason: ${reason}`);
    this.apply(
      new EditorApplicationRejectedEvent({
        applicationId: this.id,
        rejectionReason: reason,
        email: this.email.value,
      }),
    );
  }

  public generateRegistrationToken(): {
    plainToken: string;
    hashedToken: string;
  } {
    if (this.status !== EditorApplicationStatus.REGISTRATION_PENDING) {
      this.logger.warn(
        `Invalid token generation attempt for application "${this.id}" with status ${this.status}`,
      );
      throw new DomainException(
        ERRORS.EDITOR_APPLICATION.INVALID_TOKEN_GENERATION,
      );
    }
    this.logger.log(
      `Generating registration token for application "${this.id}"`,
    );

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(plainToken)
      .digest('hex');

    this.registrationTokenHash = hashedToken;
    this.registrationTokenIsUsed = false;
    this.updatedAt = new Date();

    this.apply(
      new EditorRegistrationTokenGeneratedEvent({
        applicationId: this.id,
        plainToken,
        email: this.email.value,
      }),
    );

    return {
      plainToken,
      hashedToken,
    };
  }

  public verifyRegistrationToken(token: string): boolean {
    if (!this.registrationTokenHash) {
      return false;
    }

    if (this.registrationTokenIsUsed) {
      return false;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return hashedToken === this.registrationTokenHash;
  }

  public markRegistrationTokenAsUsed(editorId: string): void {
    if (!this.registrationTokenHash) {
      this.logger.warn(
        `No registration token found for application "${this.id}" during token usage attempt`,
      );
      throw new DomainException(
        ERRORS.EDITOR_APPLICATION.NO_REGISTRATION_TOKEN,
      );
    }

    if (this.registrationTokenIsUsed) {
      this.logger.warn(
        `Registration token for application "${this.id}" has already been used`,
      );
      throw new DomainException(ERRORS.EDITOR_APPLICATION.TOKEN_ALREADY_USED);
    }

    this.logger.log(
      `Marking registration token as used for application "${this.id}", linked to editor ${editorId}`,
    );
    this.status = EditorApplicationStatus.COMPLETED;
    this.registrationTokenIsUsed = true;
    this.editorId = editorId;
    this.updatedAt = new Date();
  }
}
