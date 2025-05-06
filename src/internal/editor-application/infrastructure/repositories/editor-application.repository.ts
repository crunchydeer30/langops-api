import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { IEditorApplicationRepository } from '../../domain/ports/editor-application.repository.interface';
import { EditorApplication } from '../../domain/entities/editor-application.entity';
import { EditorApplicationMapper } from '../mappers/editor-application.mapper';
import { Email } from '@common/domain/value-objects';

@Injectable()
export class EditorApplicationRepository
  implements IEditorApplicationRepository
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: EditorApplicationMapper,
  ) {}

  async findById(id: string): Promise<EditorApplication | null> {
    const applicationModel = await this.prisma.editorApplication.findUnique({
      where: { id },
      include: {
        requestedLanguagePairs: {
          select: { languagePairId: true },
        },
      },
    });

    if (!applicationModel) return null;

    const languagePairIds = applicationModel.requestedLanguagePairs.map(
      (pair) => pair.languagePairId,
    );

    return this.mapper.toDomain(applicationModel, languagePairIds);
  }

  async findByEmail(email: Email): Promise<EditorApplication | null> {
    const applicationModel = await this.prisma.editorApplication.findUnique({
      where: { email: email.value },
      include: {
        requestedLanguagePairs: {
          select: { languagePairId: true },
        },
      },
    });

    if (!applicationModel) return null;

    const languagePairIds = applicationModel.requestedLanguagePairs.map(
      (pair) => pair.languagePairId,
    );

    return this.mapper.toDomain(applicationModel, languagePairIds);
  }

  async findByRegistrationToken(
    tokenHash: string,
  ): Promise<EditorApplication | null> {
    const applicationModel = await this.prisma.editorApplication.findFirst({
      where: {
        registrationTokenHash: tokenHash,
        registrationTokenIsUsed: false,
      },
      include: {
        requestedLanguagePairs: {
          select: { languagePairId: true },
        },
      },
    });

    if (!applicationModel) return null;

    const languagePairIds = applicationModel.requestedLanguagePairs.map(
      (pair) => pair.languagePairId,
    );

    return this.mapper.toDomain(applicationModel, languagePairIds);
  }

  async save(application: EditorApplication): Promise<void> {
    const persistenceData = this.mapper.toPersistence(application);

    await this.prisma.editorApplication.upsert({
      where: { id: application.id },
      create: persistenceData,
      update: persistenceData,
    });
  }

  async saveWithLanguagePairs(application: EditorApplication): Promise<void> {
    const persistenceData = this.mapper.toPersistence(application);

    await this.prisma.$transaction(async (tx) => {
      await tx.editorApplication.upsert({
        where: { id: application.id },
        create: persistenceData,
        update: persistenceData,
      });

      if (application.languagePairIds.length > 0) {
        await tx.editorApplicationLanguagePair.deleteMany({
          where: { applicationId: application.id },
        });

        for (const languagePairId of application.languagePairIds) {
          await tx.editorApplicationLanguagePair.create({
            data: {
              applicationId: application.id,
              languagePairId: languagePairId,
            },
          });
        }
      }
    });
  }
}
