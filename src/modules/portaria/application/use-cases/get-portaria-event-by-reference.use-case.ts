import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors';
import { PortariaEvent } from '../../domain/entities/portaria-event';
import { PortariaEventRepository } from '../../domain/repositories/portaria-event-repository';

/** Consulta usada pela portaria Condly (id interno ou externalId). */
@Injectable()
export class GetPortariaEventByReferenceUseCase {
  constructor(private readonly events: PortariaEventRepository) {}

  async execute(reference: string): Promise<PortariaEvent> {
    const event = await this.events.findByReference(reference);
    if (!event) throw new NotFoundError('Evento não encontrado');
    return event;
  }
}
