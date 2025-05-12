import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateStaffMemberCommand } from './create-staff-member.command';
import { StaffMemberRepository } from 'src/internal/staff/infrastructure/repositories/staff-member.repository';
import { ERRORS } from 'libs/contracts';
import { DomainException } from '@common/exceptions';
import { StaffMember } from 'src/internal/staff/domain/entities';
import { Logger } from '@nestjs/common';
import { Email } from '@common/domain/value-objects';

@CommandHandler(CreateStaffMemberCommand)
export class CreateStaffMemberHandler
  implements ICommandHandler<CreateStaffMemberCommand>
{
  private readonly logger = new Logger(CreateStaffMemberHandler.name);

  constructor(private readonly staffRepo: StaffMemberRepository) {}

  async execute(command: CreateStaffMemberCommand): Promise<StaffMember> {
    try {
      const { email, password, firstName, lastName, role } = command.payload;
      this.logger.log(`Creating staff member: ${email} with role: ${role}`);

      const existing = await this.staffRepo.findByEmail(Email.create(email));
      if (existing) {
        this.logger.warn(
          `Failed to create staff member: Email ${email} already exists`,
        );
        throw new DomainException(ERRORS.STAFF.EMAIL_CONFLICT);
      }

      this.logger.debug('Creating staff member domain entity');
      const staffMember = await StaffMember.create({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      this.logger.debug('Saving staff member to repository');
      await this.staffRepo.save(staffMember);

      this.logger.log(
        `Successfully created staff member with ID: ${staffMember.id}`,
      );
      return staffMember;
    } catch (error) {
      this.logger.error(
        `Failed to create staff member: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }
}
