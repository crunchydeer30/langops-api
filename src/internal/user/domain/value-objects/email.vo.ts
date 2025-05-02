import { z } from 'zod';

export class Email {
  readonly value: string;

  private constructor(value: string) {
    if (!Email.isValid(value)) throw new Error('Invalid email format');
    this.value = value.toLowerCase();
  }

  public static create(email: string): Email {
    return new Email(email);
  }

  public static isValid(email: string): boolean {
    const schema = z.string().email();
    return schema.safeParse(email).success;
  }

  public toString(): string {
    return this.value;
  }
}
