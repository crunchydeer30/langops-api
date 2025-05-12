export interface IStaffMemberPasswordResetEventPayload {
  staffMemberId: string;
  at: Date;
}

export class StaffMemberPasswordResetEvent {
  constructor(public readonly payload: IStaffMemberPasswordResetEventPayload) {}
}
