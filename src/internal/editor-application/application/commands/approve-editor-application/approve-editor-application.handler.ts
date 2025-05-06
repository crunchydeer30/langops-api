import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveEditorApplicationCommand } from './approve-editor-application.command';
import { EditorApplicationRepository } from 'src/internal/editor-application/infrastructure';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';

@CommandHandler(ApproveEditorApplicationCommand)
export class ApproveEditorApplicationHandler
  implements ICommandHandler<ApproveEditorApplicationCommand>
{
  constructor(
    private readonly editorApplicationRepository: EditorApplicationRepository,
  ) {}

  async execute(command: ApproveEditorApplicationCommand): Promise<string> {
    const { applicationId } = command.payload;

    const application =
      await this.editorApplicationRepository.findById(applicationId);

    if (!application) {
      throw new DomainException(ERRORS.EDITOR_APPLICATION.NOT_FOUND);
    }

    application.approve();
    await this.editorApplicationRepository.save(application);
    application.commit();

    return application.id;
  }
}
