export interface EmailPayload {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  from?: string;
}

export const IEmailService = Symbol('IEmailService');

export interface IEmailService {
  send(payload: EmailPayload): Promise<void>;
}
