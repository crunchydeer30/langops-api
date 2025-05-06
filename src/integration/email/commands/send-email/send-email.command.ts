import { EmailPayload } from '../../services/interfaces';

export class SendEmailCommand {
  constructor(public readonly props: EmailPayload) {}
}
