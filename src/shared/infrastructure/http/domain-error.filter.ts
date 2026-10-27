import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../domain/errors';

const STATUS_BY_ERROR = new Map<Function, HttpStatus>([
  [ValidationError, HttpStatus.BAD_REQUEST],
  [UnauthorizedError, HttpStatus.UNAUTHORIZED],
  [ForbiddenError, HttpStatus.FORBIDDEN],
  [NotFoundError, HttpStatus.NOT_FOUND],
  [ConflictError, HttpStatus.CONFLICT],
]);

/** Traduz erros de domínio/aplicação para respostas HTTP. */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const statusCode =
      STATUS_BY_ERROR.get(error.constructor) ?? HttpStatus.BAD_REQUEST;

    host.switchToHttp().getResponse<Response>().status(statusCode).json({
      statusCode,
      error: error.name,
      message: error.message,
    });
  }
}
