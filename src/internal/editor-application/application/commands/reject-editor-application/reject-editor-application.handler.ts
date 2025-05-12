import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  RejectEditorApplicationCommand,
  IRejectEditorApplicationCommandResult,
} from './reject-editor-application.command';
import { EditorApplicationRepository } from 'src/internal/editor-application/infrastructure';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';

@CommandHandler(RejectEditorApplicationCommand)
export class RejectEditorApplicationHandler
  implements ICommandHandler<RejectEditorApplicationCommand>
{
  private readonly logger = new Logger(RejectEditorApplicationHandler.name);
  constructor(
    private readonly editorApplicationRepository: EditorApplicationRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: RejectEditorApplicationCommand,
  ): Promise<IRejectEditorApplicationCommandResult> {
    const { applicationId, rejectionReason } = command.props;

    this.logger.log(
      `Attempting to reject editor application with id: ${applicationId}`,
    );

    const application =
      await this.editorApplicationRepository.findById(applicationId);

    if (!application) {
      this.logger.warn(`Editor application not found for id: ${applicationId}`);
      throw new DomainException(ERRORS.EDITOR_APPLICATION.NOT_FOUND);
    }

    application.reject(rejectionReason);
    this.logger.log(
      `Editor application rejected for id: ${applicationId}, email: ${application.email.value}, reason: ${rejectionReason}`,
    );
    await this.editorApplicationRepository.save(application);

    const applicationWithEvents =
      this.publisher.mergeObjectContext(application);
    applicationWithEvents.commit();

    this.logger.log(
      `Editor application rejection process completed for id: ${applicationId}, email: ${application.email.value}`,
    );
    return {
      success: true,
      applicationId: application.id,
    };
  }
}
