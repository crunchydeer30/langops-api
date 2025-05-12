export interface StaffMemberRegisteredEventPayload {
  staffMemberId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export class StaffMemberRegisteredEvent {
  constructor(public readonly payload: StaffMemberRegisteredEventPayload) {}
}
