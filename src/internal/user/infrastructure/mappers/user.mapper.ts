import { User as UserModel } from '@prisma/client';
import { User, IUser } from '../../domain/entities';
import { Email } from '../../domain/value-objects/email.vo';
import { VerificationToken } from '../../domain/value-objects/verification-token.vo';
import { Injectable } from '@nestjs/common';
import { UserRole } from '../../domain/entities/user-role.enum';

@Injectable()
export class UserMapper {
  toDomain(model: UserModel | null): User | null {
    if (!model) return null;

    const userProps: IUser = {
      id: model.id,
      email: Email.create(model.email),
      passwordHash: model.passwordHash,
      firstName: model.firstName,
      lastName: model.lastName,
      emailVerified: model.emailVerified,
      emailVerificationToken: model.emailVerificationTokenHash
        ? VerificationToken.fromHash(model.emailVerificationTokenHash)
        : null,
      passwordResetToken: model.passwordResetTokenHash
        ? VerificationToken.fromHash(model.passwordResetTokenHash)
        : null,
      roles: model.roles as UserRole[],
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return User.reconstitute(userProps);
  }

  toPersistence(user: User): Omit<UserModel, 'createdAt' | 'updatedAt'> {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.getPasswordHash(),
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      emailVerified: user.emailVerified,
      emailVerificationTokenHash: user.emailVerificationToken
        ? user.emailVerificationToken.hash
        : null,
      passwordResetTokenHash: user.passwordResetToken
        ? user.passwordResetToken.hash
        : null,
    };
  }
}
