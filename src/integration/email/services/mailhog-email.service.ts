import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailService, EmailPayload } from './interfaces';
import { ConfigService } from '@nestjs/config';
import { Env } from '@common/config';

@Injectable()
export class MailhogEmailService implements IEmailService {
  private readonly logger = new Logger(MailhogEmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService<Env>) {
    this.from = this.configService.getOrThrow<string>('EMAIL_DEFAULT_FROM');
    const mailhogHost = this.configService.getOrThrow<string>('MAILHOG_HOST');
    const mailhogPort = this.configService.getOrThrow<number>('MAILHOG_PORT');

    this.transporter = nodemailer.createTransport({
      host: mailhogHost,
      port: mailhogPort,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.logger.log(
      `MailHog Email Service initialized. Host: ${mailhogHost}, Port: ${mailhogPort}`,
    );
  }

  async send(payload: EmailPayload): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await this.transporter.sendMail({
        from: payload.from || this.from,
        to: payload.to,
        subject: payload.subject,
        text: payload.textBody,
        html: payload.htmlBody,
      });
      this.logger.log(
        `Email with subject "${payload.subject}" sent to "${JSON.stringify(payload.to)}"`,
      );
      this.logger.debug(`MailHog response: ${JSON.stringify(response)}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email with subject "${payload.subject}" to "${JSON.stringify(payload.to)}", error: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }
}
