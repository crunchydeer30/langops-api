import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AuthenticateUserCommand } from './authenticate-user.command';
import { Email } from '../../../../user/domain/value-objects/email.vo';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../interfaces/jwt-payload.interface';
import { UserRepository } from 'src/internal/user/infrastructure/repositories/user.repository';
import { UserLoggedInEvent } from 'src/internal/user/domain/events';

@CommandHandler(AuthenticateUserCommand)
export class AuthenticateUserHandler
  implements ICommandHandler<AuthenticateUserCommand, { accessToken: string }>
{
  private readonly logger = new Logger(AuthenticateUserHandler.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    props,
  }: AuthenticateUserCommand): Promise<{ accessToken: string }> {
    try {
      this.logger.log(`Authenticating user: ${props.email}`);
      const { email, passwordPlain } = props;

      const user = await this.userRepository.findByEmail(Email.create(email));

      if (!user) {
        this.logger.log('Failed to authenticate user: User not found');
        throw new UnauthorizedException('Invalid credentials.');
      }

      const isPasswordValid = await user.comparePassword(passwordPlain);

      if (!isPasswordValid) {
        this.logger.log('Failed to authenticate user: Invalid password');
        throw new UnauthorizedException('Invalid credentials.');
      }

      this.logger.log(`Issuing access token for user: ${email}`);
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email.value,
        roles: user.roles,
      };

      const accessToken = this.jwtService.sign(payload);

      this.eventBus.publish(
        new UserLoggedInEvent({ userId: user.id, at: new Date() }),
      );

      this.logger.log(`Successfully issued access token for user: ${email}`);
      return { accessToken };
    } catch (error: unknown) {
      this.logger.error(
        `Failed to authenticate user: ${JSON.stringify(error)}`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }
  }
}
