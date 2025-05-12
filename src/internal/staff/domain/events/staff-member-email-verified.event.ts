export interface StaffMemberEmailVerifiedEventPayload {
  staffMemberId: string;
}

export class StaffMemberEmailVerifiedEvent {
  constructor(public readonly payload: StaffMemberEmailVerifiedEventPayload) {}
}
