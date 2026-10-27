import { Injectable } from '@nestjs/common';
import {
  Actor,
  assertCondominiumAccess,
} from '../../../../shared/application/actor';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Role } from '../../../../shared/domain/role';
import { PortariaEvent } from '../../domain/entities/portaria-event';
import { PortariaEventRepository } from '../../domain/repositories/portaria-event-repository';

@Injectable()
export class GetPortariaEventUseCase {
  constructor(private readonly events: PortariaEventRepository) {}

  async execute(actor: Actor, id: string): Promise<PortariaEvent> {
    const event = await this.events.findById(id);
    if (
      !event ||
      (actor.role === Role.MORADOR && actor.apartmentId !== event.apartmentId)
    ) {
      throw new NotFoundError('Evento não encontrado');
    }
    assertCondominiumAccess(actor, event.condominiumId);
    return event;
  }
}
