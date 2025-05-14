import { Injectable } from '@nestjs/common';
import { StaffMember as StaffMemberModel } from '@prisma/client';
import {
  StaffMember,
  IStaffMember,
} from '../../domain/entities/staff-member.entity';
import { Email } from '@common/domain/value-objects/email.vo';
import { VerificationToken } from '@common/domain/value-objects/verification-token.vo';

@Injectable()
export class StaffMemberMapper {
  toDomain(model: StaffMemberModel): StaffMember {
    const props: IStaffMember = {
      id: model.id,
      email: Email.create(model.email),
      passwordHash: model.passwordHash,
      firstName: model.firstName,
      lastName: model.lastName,
      role: model.role,
      passwordResetToken: model.passwordResetTokenHash
        ? new VerificationToken(model.passwordResetTokenHash)
        : null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return StaffMember.reconstitute(props);
  }

  toPersistence(
    entity: StaffMember,
  ): Omit<StaffMemberModel, 'createdAt' | 'updatedAt'> &
    Partial<Pick<StaffMemberModel, 'createdAt' | 'updatedAt'>> {
    return {
      id: entity.id,
      email: entity.email.value,
      passwordHash: entity.passwordHash,
      firstName: entity.firstName,
      lastName: entity.lastName,
      role: entity.role,
      passwordResetTokenHash: entity.passwordResetToken?.hash || null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
