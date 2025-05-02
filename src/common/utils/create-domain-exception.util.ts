import { DomainException } from '@common/exceptions';

export function createDomainException(
  error: unknown,
  domainError: { code: string; message: string; httpStatus: number },
): DomainException {
  if (error instanceof DomainException) {
    return error;
  }

  return new DomainException(domainError, error);
}
