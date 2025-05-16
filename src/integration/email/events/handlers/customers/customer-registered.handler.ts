import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CustomerRegisteredEvent } from 'src/internal/customer/domain/events';
import { SendEmailCommand } from 'src/integration/email/commands';

@EventsHandler(CustomerRegisteredEvent)
export class CustomerRegisteredHandler
  implements IEventHandler<CustomerRegisteredEvent>
{
  private readonly logger = new Logger(CustomerRegisteredHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: CustomerRegisteredEvent) {
    this.logger.log(
      `Handling CustomerRegisteredEvent for customer ID: ${event.payload.customerId}`,
    );

    try {
      const customerName =
        `${event.payload.firstName || ''} ${event.payload.lastName || ''}`.trim() ||
        'Valued Customer';

      const emailPayload = {
        to: event.payload.email,
        subject: 'Welcome to Our Platform!',
        htmlBody: `<p>Hello ${customerName},</p><p>Welcome! We're excited to have you.</p><p>Best regards,<br>The Team</p>`,
      };

      this.logger.log(`Sending welcome email to "${event.payload.email}"`);
      await this.commandBus.execute(new SendEmailCommand(emailPayload));
    } catch (error) {
      this.logger.error(
        `Failed to handle CustomerRegisteredEvent for customer ID "${event.payload.customerId}": ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
    }
  }
}
