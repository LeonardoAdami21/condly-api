import { Injectable } from '@nestjs/common';
import { Actor, condominiumScope } from '../../../../shared/application/actor';
import {
  emptyPage,
  paginate,
  Paginated,
} from '../../../../shared/application/pagination';
import { PaginationParams } from '../../../../shared/domain/pagination';
import { Role } from '../../../../shared/domain/role';
import { Apartment } from '../../domain/entities/apartment';
import { ApartmentRepository } from '../../domain/repositories/apartment-repository';

export interface ListApartmentsInput extends PaginationParams {
  condominiumId?: string;
  block?: string;
}

@Injectable()
export class ListApartmentsUseCase {
  constructor(private readonly apartments: ApartmentRepository) {}

  async execute(
    actor: Actor,
    { condominiumId, block, ...pagination }: ListApartmentsInput,
  ): Promise<Paginated<Apartment>> {
    const scope = condominiumScope(actor, condominiumId);
    const isResident = actor.role === Role.MORADOR;
    if (!scope || (isResident && !actor.apartmentId)) {
      return emptyPage(pagination);
    }

    const page = await this.apartments.findMany(
      {
        ...scope,
        block: block?.toUpperCase(),
        // Moradores enxergam apenas o próprio apartamento
        id: isResident ? actor.apartmentId! : undefined,
      },
      pagination,
    );
    return paginate(page, pagination);
  }
}
