import { DomainException } from '@common/exceptions/domain.exception';

export function isDomainException(error: unknown): error is DomainException {
  return error instanceof DomainException;
}
