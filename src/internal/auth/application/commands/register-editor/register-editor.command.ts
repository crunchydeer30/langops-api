export interface RegisterEditorCommandPayload {
  token: string;
  applicationId: string;
  password: string;
}

export class RegisterEditorCommand {
  constructor(public readonly payload: RegisterEditorCommandPayload) {}
}
