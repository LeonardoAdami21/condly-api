import { ForbiddenError } from '../../../../shared/domain/errors';
import { Role } from '../../../../shared/domain/role';

/** Síndicos só gerenciam porteiros e moradores; ADMIN gerencia todos. */
export function assertCanManageRole(actorRole: Role, targetRole: Role) {
  if (
    actorRole !== Role.ADMIN &&
    (targetRole === Role.ADMIN || targetRole === Role.SINDICO)
  ) {
    throw new ForbiddenError(`Sem permissão para gerenciar ${targetRole}`);
  }
}
