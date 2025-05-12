export interface StaffMemberEmailVerificationTokenGeneratedEventPayload {
  staffMemberId: string;
  plainToken: string;
}

export class StaffMemberEmailVerificationTokenGeneratedEvent {
  constructor(
    public readonly payload: StaffMemberEmailVerificationTokenGeneratedEventPayload,
  ) {}
}
