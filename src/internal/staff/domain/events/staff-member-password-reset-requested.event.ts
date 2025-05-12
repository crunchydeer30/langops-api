export interface IStaffMemberPasswordResetRequestedEventPayload {
  staffMemberId: string;
  plainToken: string;
  at: Date;
}

export class StaffMemberPasswordResetRequestedEvent {
  constructor(
    public readonly payload: IStaffMemberPasswordResetRequestedEventPayload,
  ) {}
}
