import { StaffRole } from '@prisma/client';
import { ICommand } from '@nestjs/cqrs';

export interface ICreateStaffMemberCommandPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
}

export class CreateStaffMemberCommand implements ICommand {
  constructor(public readonly payload: ICreateStaffMemberCommandPayload) {}
}
