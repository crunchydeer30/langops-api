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
    // Ensure buffers are of the same length for timingSafeEqual
    const storedHashBuffer = Buffer.from(this.hash, 'hex');
    const comparisonHashBuffer = Buffer.from(hashToCompare, 'hex');

    if (storedHashBuffer.length !== comparisonHashBuffer.length) {
      // This should not happen if hashes are generated consistently (e.g. SHA256 produces fixed length)
      // but as a safeguard:
      return false;
    }
    return timingSafeEqual(storedHashBuffer, comparisonHashBuffer);
  }
}
