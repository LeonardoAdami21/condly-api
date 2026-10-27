import { Injectable } from '@nestjs/common';
import {
  Actor,
  assertCondominiumAccess,
} from '../../../../shared/application/actor';
import { NotFoundError } from '../../../../shared/domain/errors';
import { PortariaEvent } from '../../domain/entities/portaria-event';
import { PortariaEventRepository } from '../../domain/repositories/portaria-event-repository';

export interface FinalizePortariaEventInput {
  /** id interno ou externalId da portaria Condly */
  reference: string;
  /** Ausente quando a chamada vem da integração Condly. */
  actor?: Actor;
}

@Injectable()
export class FinalizePortariaEventUseCase {
  constructor(private readonly events: PortariaEventRepository) {}

  async execute({
    reference,
    actor,
  }: FinalizePortariaEventInput): Promise<PortariaEvent> {
    const event = await this.events.findByReference(reference);
    if (!event) throw new NotFoundError('Evento não encontrado');
    if (actor) assertCondominiumAccess(actor, event.condominiumId);

    event.finalize();
    await this.events.save(event);
    return event;
  }
}
