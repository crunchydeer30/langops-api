export interface StaffMemberPasswordChangedEventPayload {
  staffMemberId: string;
  at: Date;
}

export class StaffMemberPasswordChangedEvent {
  constructor(
    public readonly payload: StaffMemberPasswordChangedEventPayload,
  ) {}
}
