export class DomainException extends Error {
  public readonly code: string;
  public readonly httpStatus: number;

  constructor(
    error: {
      code: string;
      message: string;
      httpStatus: number;
    },
    cause?: unknown,
  ) {
    super(error.message);
    this.name = this.constructor.name;
    this.code = error.code;
    this.httpStatus = error.httpStatus;
    this.cause = cause;
  }
}
