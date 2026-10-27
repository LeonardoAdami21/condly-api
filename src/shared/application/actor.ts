import { ForbiddenError } from '../domain/errors';
import { Role } from '../domain/role';

/** Usuário autenticado executando um caso de uso. */
export interface Actor {
  id: string;
  role: Role;
  condominiumId: string | null;
  apartmentId: string | null;
}

/** ADMIN acessa tudo; os demais perfis apenas o próprio condomínio. */
export function assertCondominiumAccess(
  actor: Actor,
  condominiumId: string | null,
) {
  if (actor.role !== Role.ADMIN && actor.condominiumId !== condominiumId) {
    throw new ForbiddenError('Sem acesso a este condomínio');
  }
}

/**
 * Condomínio a que uma listagem deve se restringir.
 * `null` indica que o ator não tem acesso a nenhum condomínio.
 */
export function condominiumScope(
  actor: Actor,
  requested?: string,
): { condominiumId?: string } | null {
  if (actor.role === Role.ADMIN) return { condominiumId: requested };
  return actor.condominiumId ? { condominiumId: actor.condominiumId } : null;
}
