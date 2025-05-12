import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(SubmitEditorApplicationHandler.name);
  constructor(
    private readonly editorApplicationRepository: EditorApplicationRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: SubmitEditorApplicationCommand,
  ): Promise<EditorApplication> {
    const { email, firstName, lastName, languagePairIds } = command.props;

    this.logger.log(
      `Attempting to submit editor application for email: ${email}`,
    );

    const existingApplication =
      await this.editorApplicationRepository.findByEmail(Email.create(email));

    if (existingApplication) {
      this.logger.warn(
        `Duplicate editor application attempt for email: ${email}`,
      );
      throw new DomainException(ERRORS.EDITOR_APPLICATION.ALREADY_EXISTS);
    }

    const application = EditorApplication.create({
      email,
      firstName,
      lastName,
      languagePairIds,
    });
    this.logger.log(
      `Created new editor application for email: ${email}, applicationId: ${application.id}`,
    );
    await this.editorApplicationRepository.saveWithLanguagePairs(application);

    const applicationWithEvents =
      this.publisher.mergeObjectContext(application);
    applicationWithEvents.commit();

    this.logger.log(
      `Editor application submitted successfully for email: ${email}, applicationId: ${application.id}`,
    );
    return application;
  }
}
