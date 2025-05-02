import { UserRole } from '../../../domain/entities/user-role.enum';

interface RegisterUserCommandProps {
  email: string;
  passwordPlain: string;
  firstName: string;
  lastName: string;
  roles?: UserRole[];
}

export class RegisterUserCommand {
  constructor(public readonly props: RegisterUserCommandProps) {}
}
