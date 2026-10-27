import { ForbiddenException } from '@nestjs/common';
import { Role } from '../generated/prisma/enums';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  condominiumId: string | null;
  apartmentId: string | null;
}

/** ADMIN acessa tudo; os demais perfis apenas o próprio condomínio. */
export function assertCondominiumAccess(user: AuthUser, condominiumId: string) {
  if (user.role !== Role.ADMIN && user.condominiumId !== condominiumId) {
    throw new ForbiddenException('Sem acesso a este condomínio');
  }
}
