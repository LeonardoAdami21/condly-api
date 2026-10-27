import { Injectable } from '@nestjs/common';
import {
  Actor,
  assertCondominiumAccess,
} from '../../../../shared/application/actor';
import {
  NotFoundError,
  ValidationError,
} from '../../../../shared/domain/errors';
import { Role } from '../../../../shared/domain/role';
import { ApartmentRepository } from '../../../condominium/domain/repositories/apartment-repository';
import { CondominiumRepository } from '../../../condominium/domain/repositories/condominium-repository';
import { UserAssignment } from '../../domain/entities/user';

/**
 * Resolve condomínio/apartamento de um usuário garantindo que existam,
 * que o apartamento pertença ao condomínio e que o ator tenha acesso a ele.
 */
@Injectable()
export class UserAssignmentResolver {
  constructor(
    private readonly condominiums: CondominiumRepository,
    private readonly apartments: ApartmentRepository,
  ) {}

  async resolve(
    actor: Actor,
    input: {
      role: Role;
      condominiumId?: string | null;
      apartmentId?: string | null;
    },
  ): Promise<UserAssignment> {
    if (input.role === Role.ADMIN) {
      return { role: input.role, condominiumId: null, apartmentId: null };
    }

    // Síndicos sempre cadastram no próprio condomínio
    let condominiumId =
      actor.role === Role.ADMIN ? input.condominiumId : actor.condominiumId;
    let apartmentId: string | null = null;

    if (input.apartmentId) {
      const apartment = await this.apartments.findById(input.apartmentId);
      if (!apartment) throw new NotFoundError('Apartamento não encontrado');
      if (condominiumId && condominiumId !== apartment.condominiumId) {
        throw new ValidationError(
          'Apartamento não pertence ao condomínio informado',
        );
      }
      condominiumId = apartment.condominiumId;
      apartmentId = apartment.id;
    }

    if (condominiumId) {
      assertCondominiumAccess(actor, condominiumId);
      if (!(await this.condominiums.findById(condominiumId))) {
        throw new NotFoundError('Condomínio não encontrado');
      }
    }

    return {
      role: input.role,
      condominiumId: condominiumId ?? null,
      apartmentId,
    };
  }
}
