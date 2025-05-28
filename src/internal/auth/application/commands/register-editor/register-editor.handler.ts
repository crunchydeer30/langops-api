import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import {
  IRegisterEditorCommandResult,
  RegisterEditorCommand,
} from './register-editor.command';
import { EditorApplicationRepository } from 'src/internal/editor-application/infrastructure';
import { Logger } from '@nestjs/common';
import { DomainException } from '@common/exceptions';
import { ERRORS } from '@libs/contracts/common';
import { Editor } from 'src/internal/editor/domain/entities/editor.entity';
import { EditorRepository } from 'src/internal/editor/infrastructure';
import { EditorLanguagePairRepository } from 'src/internal/editor/infrastructure/repositories/editor-language-pair.repository';
import { EditorLanguagePair } from 'src/internal/editor/domain/entities/editor-language-pair.entity';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories/language-pair.repository';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  UserRole,
} from 'src/internal/auth/application/interfaces/jwt-payload.interface';

@CommandHandler(RegisterEditorCommand)
export class RegisterEditorHandler
  implements ICommandHandler<RegisterEditorCommand>
{
  private readonly logger = new Logger(RegisterEditorHandler.name);

  constructor(
    private readonly editorApplicationRepository: EditorApplicationRepository,
    private readonly editorRepository: EditorRepository,
    private readonly editorLanguagePairRepository: EditorLanguagePairRepository,
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly jwtService: JwtService,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: RegisterEditorCommand,
  ): Promise<IRegisterEditorCommandResult> {
    const { applicationId, token, password } = command.props;

    this.logger.log(
      `Attempting to register editor with application ID: ${applicationId}`,
    );

    const application =
      await this.editorApplicationRepository.findById(applicationId);
    if (!application) {
      this.logger.warn(`Editor application not found for ID: ${applicationId}`);
      throw new DomainException(ERRORS.EDITOR_APPLICATION.NOT_FOUND);
    }

    if (!application.verifyRegistrationToken(token)) {
      this.logger.warn(
        `Invalid registration token provided for application ID: ${applicationId}`,
      );
      throw new DomainException(
        ERRORS.EDITOR_APPLICATION.REGISTRATION_TOKEN_INVALID,
      );
    }

    const editor = await Editor.create({
      email: application.email.value,
      password,
      firstName: application.firstName,
      lastName: application.lastName,
    });

    this.logger.log(`Editor entity created with ID: ${editor.id}`);

    application.markRegistrationTokenAsUsed(editor.id);

    const languagePairs = await this.languagePairRepository.findManyById(
      application.languagePairIds,
    );

    this.logger.log(
      `Creating editor language pairs for ${languagePairs.length} language pairs`,
    );

    const editorLanguagePairs = languagePairs.map((languagePair) => {
      return EditorLanguagePair.create({
        editorId: editor.id,
        languagePairId: languagePair.id,
      });
    });

    await this.editorRepository.save(editor);
    await this.editorLanguagePairRepository.saveMany(editorLanguagePairs);
    await this.editorApplicationRepository.save(application);

    this.logger.log(`Publishing events for new editor with ID: ${editor.id}`);

    const editorWithEvents = this.publisher.mergeObjectContext(editor);
    editorWithEvents.commit();

    const applicationWithEvents =
      this.publisher.mergeObjectContext(application);
    applicationWithEvents.commit();

    const payload: JwtPayload = {
      id: editor.id,
      roles: [UserRole.EDITOR],
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(
      `Successfully registered editor with email: ${editor.email.value}`,
    );

    return {
      userId: editor.id,
      accessToken,
    };
  }
}
