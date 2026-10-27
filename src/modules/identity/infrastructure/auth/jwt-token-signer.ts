import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayload,
  TokenSigner,
} from '../../application/ports/token-signer';

@Injectable()
export class JwtTokenSigner implements TokenSigner {
  constructor(private readonly jwt: JwtService) {}

  sign(payload: AccessTokenPayload) {
    return this.jwt.signAsync({ ...payload });
  }
}
