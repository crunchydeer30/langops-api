import { Email } from '@common/domain/value-objects/email.vo';
import { StaffMember } from '../entities/staff-member.entity';

export interface IStaffMemberRepository {
  findById(id: string): Promise<StaffMember | null>;
  findByEmail(email: Email): Promise<StaffMember | null>;
  save(staffMember: StaffMember): Promise<StaffMember>;
}
