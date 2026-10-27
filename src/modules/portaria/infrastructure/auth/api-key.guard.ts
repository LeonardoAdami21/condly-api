import { timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const API_KEY_HEADER = 'x-api-key';

/** Autentica o sistema de portaria Condly por chave de API. */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.getOrThrow<string>('CONDLY_PORTARIA_API_KEY');
    const received = context.switchToHttp().getRequest().headers[
      API_KEY_HEADER
    ];

    if (
      typeof received !== 'string' ||
      received.length !== expected.length ||
      !timingSafeEqual(Buffer.from(received), Buffer.from(expected))
    ) {
      throw new UnauthorizedException('Chave de API inválida');
    }
    return true;
  }
}
