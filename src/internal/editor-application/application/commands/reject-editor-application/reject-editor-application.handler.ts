import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectEditorApplicationCommand } from './reject-editor-application.command';
import { EditorApplicationRepository } from 'src/internal/editor-application/infrastructure';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';

@CommandHandler(RejectEditorApplicationCommand)
export class RejectEditorApplicationHandler
  implements ICommandHandler<RejectEditorApplicationCommand>
{
  constructor(
    private readonly editorApplicationRepository: EditorApplicationRepository,
  ) {}

  async execute(command: RejectEditorApplicationCommand): Promise<string> {
    const { applicationId, rejectionReason } = command.payload;

    const application =
      await this.editorApplicationRepository.findById(applicationId);

    if (!application) {
      throw new DomainException(ERRORS.EDITOR_APPLICATION.NOT_FOUND);
    }

    application.reject(rejectionReason);
    await this.editorApplicationRepository.save(application);
    application.commit();

    return application.id;
  }
}
