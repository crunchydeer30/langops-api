import { z } from 'zod';

export class Email {
  constructor(public readonly value: string) {}
  static create(email: string): Email {
    if (!this.validate(email)) {
      throw new Error('Invalid email format');
    }
    return new Email(email);
  }

  static validate(email: string) {
    const validationSchema = z.string().email();
    return validationSchema.safeParse(email).success;
  }
}
