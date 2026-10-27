import { Role } from '../../../../shared/domain/role';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export abstract class TokenSigner {
  abstract sign(payload: AccessTokenPayload): Promise<string>;
}
