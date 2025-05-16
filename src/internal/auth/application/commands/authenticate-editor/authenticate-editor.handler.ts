import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthenticateEditorCommand } from './authenticate-editor.command';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, UserRole } from '../../interfaces/jwt-payload.interface';
import { Email } from '@common/domain/value-objects';
import { EditorRepository } from 'src/internal/editor/infrastructure/repositories/editor.repository';

@CommandHandler(AuthenticateEditorCommand)
export class AuthenticateEditorHandler
  implements ICommandHandler<AuthenticateEditorCommand, { accessToken: string }>
{
  private readonly logger = new Logger(AuthenticateEditorHandler.name);

  constructor(
    private readonly editorRepository: EditorRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({
    props,
  }: AuthenticateEditorCommand): Promise<{ accessToken: string }> {
    this.logger.log(`Authenticating editor: ${props.email}`);
    const { email, password } = props;

    const editor = await this.editorRepository.findByEmail(Email.create(email));

    if (!editor) {
      this.logger.warn(
        `Failed to authenticate editor: Editor with email ${email} not found`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await editor.comparePassword(password);

    if (!isPasswordValid) {
      this.logger.warn(
        `Failed to authenticate editor: Invalid password for ${email}`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }

    this.logger.log(`Issuing access token for editor: ${email}`);
    const payload: JwtPayload = {
      id: editor.id,
      roles: [UserRole.EDITOR],
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(
      `Successfully authenticated editor with ID: ${editor.id}, email: ${email}`,
    );

    return { accessToken };
  }
}
