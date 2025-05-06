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

export interface IEditorApplication {
  id: string;
  email: Email;
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
  languagePairIds: string[];
}

export class EditorApplication
  extends AggregateRoot
  implements IEditorApplication
{
  public id: string;
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
      throw new DomainException(
        ERRORS.EDITOR_APPLICATION.INVALID_STATUS_TRANSITION,
      );
    }

    this.status = EditorApplicationStatus.REGISTRATION_PENDING;
    this.updatedAt = new Date();
    this.apply(new EditorApplicationApprovedEvent({ applicationId: this.id }));
    this.generateRegistrationToken();
  }

  public reject(reason: string): void {
    if (this.status !== EditorApplicationStatus.PENDING_REVIEW) {
      throw new DomainException(
        ERRORS.EDITOR_APPLICATION.INVALID_STATUS_TRANSITION,
      );
    }

    this.status = EditorApplicationStatus.REJECTED;
    this.rejectionReason = reason;
    this.updatedAt = new Date();
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
      throw new DomainException(
        ERRORS.EDITOR_APPLICATION.INVALID_TOKEN_GENERATION,
      );
    }

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
      throw new DomainException(
        ERRORS.EDITOR_APPLICATION.NO_REGISTRATION_TOKEN,
      );
    }

    if (this.registrationTokenIsUsed) {
      throw new DomainException(ERRORS.EDITOR_APPLICATION.TOKEN_ALREADY_USED);
    }

    this.status = EditorApplicationStatus.COMPLETED;
    this.registrationTokenIsUsed = true;
    this.editorId = editorId;
    this.updatedAt = new Date();
  }
}
