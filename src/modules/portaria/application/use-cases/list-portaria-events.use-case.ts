import { Injectable } from '@nestjs/common';
import { Actor, condominiumScope } from '../../../../shared/application/actor';
import {
  emptyPage,
  paginate,
  Paginated,
} from '../../../../shared/application/pagination';
import { PaginationParams } from '../../../../shared/domain/pagination';
import { Role } from '../../../../shared/domain/role';
import { PortariaEvent } from '../../domain/entities/portaria-event';
import {
  PortariaEventFilter,
  PortariaEventRepository,
} from '../../domain/repositories/portaria-event-repository';

export type ListPortariaEventsInput = PaginationParams & PortariaEventFilter;

@Injectable()
export class ListPortariaEventsUseCase {
  constructor(private readonly events: PortariaEventRepository) {}

  async execute(
    actor: Actor,
    {
      condominiumId,
      apartmentId,
      status,
      type,
      ...pagination
    }: ListPortariaEventsInput,
  ): Promise<Paginated<PortariaEvent>> {
    const scope = condominiumScope(actor, condominiumId);
    const isResident = actor.role === Role.MORADOR;
    if (!scope || (isResident && !actor.apartmentId)) {
      return emptyPage(pagination);
    }

    const page = await this.events.findMany(
      {
        ...scope,
        apartmentId: isResident ? actor.apartmentId! : apartmentId,
        status,
        type,
      },
      pagination,
    );
    return paginate(page, pagination);
  }
}
