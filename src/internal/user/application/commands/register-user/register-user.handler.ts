import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RegisterUserCommand } from './register-user.command';
import { User } from '../../../domain/entities';
import { Logger } from '@nestjs/common';
import { Email } from '../../../domain/value-objects/email.vo';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts';
import { UserRepository } from 'src/internal/user/infrastructure';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  private readonly logger = new Logger(RegisterUserHandler.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute({ props }: RegisterUserCommand): Promise<User> {
    const { email, passwordPlain, firstName, lastName, roles } = props;
    this.logger.log(
      `Registering user: ${JSON.stringify({ email, firstName, lastName, roles })}`,
    );

    const existingUser = await this.userRepository.findByEmail(
      Email.create(email),
    );

    if (existingUser) {
      this.logger.log(
        `Failed to register user: email "${email}" is already in use`,
      );
      throw new DomainException(ERRORS.AUTH.EMAIL_CONFLICT);
    }

    const user = await User.create({
      email,
      password: passwordPlain,
      firstName,
      lastName,
      roles,
    });

    await this.userRepository.save(user);

    this.publisher.mergeObjectContext(user);
    user.commit();

    this.logger.log(`Successfully registered user: ${email}`);

    return user;
  }
}
