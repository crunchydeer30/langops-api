import { Injectable } from '@nestjs/common';
import {
  EditorApplication as EditorApplicationModel,
  Prisma,
} from '@prisma/client';
import { Email } from '@common/domain/value-objects';
import {
  EditorApplication,
  IEditorApplication,
} from '../../domain/entities/editor-application.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EditorApplicationMapper {
  toDomain(
    model: EditorApplicationModel | null,
    languagePairIds: string[] = [],
  ): EditorApplication | null {
    if (!model) return null;

    const applicationProps: IEditorApplication & { languagePairIds: string[] } =
      {
        id: model.id,
        email: Email.create(model.email),
        status: model.status,
        rejectionReason: model.rejectionReason,
        registrationTokenHash: model.registrationTokenHash,
        registrationTokenIsUsed: model.registrationTokenIsUsed,
        editorId: model.editorId,
        firstName: model.firstName,
        lastName: model.lastName,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        languagePairIds: languagePairIds,
      };

    return EditorApplication.reconstitute(applicationProps);
  }

  toPersistence(
    application: EditorApplication,
  ): Omit<EditorApplicationModel, 'createdAt' | 'updatedAt'> {
    return {
      id: application.id,
      email: application.email.value,
      status: application.status,
      firstName: application.firstName,
      lastName: application.lastName,
      rejectionReason: application.rejectionReason,
      registrationTokenHash: application.registrationTokenHash,
      registrationTokenIsUsed: application.registrationTokenIsUsed,
      editorId: application.editorId,
    };
  }

  toLanguagePairConnections(
    applicationId: string,
    languagePairIds: string[],
  ): Prisma.EditorApplicationLanguagePairCreateManyInput[] {
    return languagePairIds.map((languagePairId) => ({
      id: uuidv4(),
      applicationId: applicationId,
      languagePairId: languagePairId,
    }));
  }
}
