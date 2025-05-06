import { randomBytes, createHash, timingSafeEqual } from 'crypto';

export class VerificationToken {
  constructor(public readonly hash: string) {}

  static generate(): {
    plainToken: string;
    verificationToken: VerificationToken;
  } {
    const plainToken = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(plainToken).digest('hex');
    const verificationToken = new VerificationToken(hash);
    return { plainToken, verificationToken };
  }

  compare(plainTokenToCompare: string): boolean {
    const hashToCompare = createHash('sha256')
      .update(plainTokenToCompare)
      .digest('hex');
    const storedHashBuffer = Buffer.from(this.hash, 'hex');
    const comparisonHashBuffer = Buffer.from(hashToCompare, 'hex');

    if (storedHashBuffer.length !== comparisonHashBuffer.length) {
      return false;
    }
    return timingSafeEqual(storedHashBuffer, comparisonHashBuffer);
  }
}
