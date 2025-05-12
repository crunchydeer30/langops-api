import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitEditorApplicationCommand } from './submit-editor-application.command';
import { EditorApplication } from '../../../domain/entities/editor-application.entity';
import { Email } from '@common/domain/value-objects';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { EditorApplicationRepository } from 'src/internal/editor-application/infrastructure';

@CommandHandler(SubmitEditorApplicationCommand)
export class SubmitEditorApplicationHandler
  implements ICommandHandler<SubmitEditorApplicationCommand>
{
  constructor(
    private readonly editorApplicationRepository: EditorApplicationRepository,
  ) {}

  async execute(
    command: SubmitEditorApplicationCommand,
  ): Promise<EditorApplication> {
    const { email, firstName, lastName, languagePairIds } = command.payload;

    const existingApplication =
      await this.editorApplicationRepository.findByEmail(Email.create(email));

    if (existingApplication) {
      throw new DomainException(ERRORS.EDITOR_APPLICATION.ALREADY_EXISTS);
    }

    const application = EditorApplication.create({
      email,
      firstName,
      lastName,
      languagePairIds,
    });
    await this.editorApplicationRepository.saveWithLanguagePairs(application);
    application.commit();

    return application;
  }
}
