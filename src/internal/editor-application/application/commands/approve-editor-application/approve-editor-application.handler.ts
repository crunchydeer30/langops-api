import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  ApproveEditorApplicationCommand,
  IApproveEditorApplicationCommandResult,
} from './approve-editor-application.command';
import { EditorApplicationRepository } from 'src/internal/editor-application/infrastructure';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';

@CommandHandler(ApproveEditorApplicationCommand)
export class ApproveEditorApplicationHandler
  implements ICommandHandler<ApproveEditorApplicationCommand>
{
  private readonly logger = new Logger(ApproveEditorApplicationHandler.name);
  constructor(
    private readonly editorApplicationRepository: EditorApplicationRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: ApproveEditorApplicationCommand,
  ): Promise<IApproveEditorApplicationCommandResult> {
    const { applicationId } = command.props;

    this.logger.log(
      `Attempting to approve editor application with id: ${applicationId}`,
    );

    const application =
      await this.editorApplicationRepository.findById(applicationId);

    if (!application) {
      this.logger.warn(`Editor application not found for id: ${applicationId}`);
      throw new DomainException(ERRORS.EDITOR_APPLICATION.NOT_FOUND);
    }

    application.approve();
    this.logger.log(
      `Editor application approved for id: ${applicationId}, email: ${application.email.value}`,
    );
    await this.editorApplicationRepository.save(application);

    const applicationWithEvents =
      this.publisher.mergeObjectContext(application);
    applicationWithEvents.commit();

    this.logger.log(
      `Editor application approval process completed for id: ${applicationId}, email: ${application.email.value}`,
    );
    return {
      success: true,
      editorId: application.id,
    };
  }
}
