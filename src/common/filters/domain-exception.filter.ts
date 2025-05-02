import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.httpStatus;

    const responseBody = {
      timestamp: new Date().toISOString(),
      path: request.url,
      code: exception.code,
      message: exception.message,
    };

    if (status === 500) {
      this.logger.error(JSON.stringify(exception.cause), exception.stack);
    }

    response.status(status).json(responseBody);
  }
}
