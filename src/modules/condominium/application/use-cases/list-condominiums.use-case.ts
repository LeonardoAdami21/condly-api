import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import {
  emptyPage,
  paginate,
  Paginated,
} from '../../../../shared/application/pagination';
import { PaginationParams } from '../../../../shared/domain/pagination';
import { Role } from '../../../../shared/domain/role';
import { Condominium } from '../../domain/entities/condominium';
import { CondominiumRepository } from '../../domain/repositories/condominium-repository';

@Injectable()
export class ListCondominiumsUseCase {
  constructor(private readonly condominiums: CondominiumRepository) {}

  async execute(
    actor: Actor,
    pagination: PaginationParams,
  ): Promise<Paginated<Condominium>> {
    if (actor.role !== Role.ADMIN && !actor.condominiumId) {
      return emptyPage(pagination);
    }
    const filter =
      actor.role === Role.ADMIN ? {} : { id: actor.condominiumId! };
    return paginate(
      await this.condominiums.findMany(filter, pagination),
      pagination,
    );
  }
}
