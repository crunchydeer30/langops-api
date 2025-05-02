import { randomBytes, createHash } from 'crypto';

export class VerificationToken {
  private constructor(
    private readonly token: string,
    private readonly hashed: string,
  ) {}

  static create(): VerificationToken {
    const token = randomBytes(32).toString('hex');
    const hashed = createHash('sha256').update(token).digest('hex');
    return new VerificationToken(token, hashed);
  }

  static fromHash(hashed: string): VerificationToken {
    return new VerificationToken('', hashed);
  }

  verify(candidate: string): boolean {
    const candidateHash = createHash('sha256').update(candidate).digest('hex');
    return candidateHash === this.hashed;
  }

  get value(): string {
    return this.token;
  }
  get hash(): string {
    return this.hashed;
  }
}
