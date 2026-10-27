import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import { PortariaEvent } from '../../domain/entities/portaria-event';
import { ResidentDecision } from '../../domain/enums/portaria-event-status';
import { PortariaEventRepository } from '../../domain/repositories/portaria-event-repository';
import { GetPortariaEventUseCase } from './get-portaria-event.use-case';

@Injectable()
export class RespondPortariaEventUseCase {
  constructor(
    private readonly events: PortariaEventRepository,
    private readonly getEvent: GetPortariaEventUseCase,
  ) {}

  async execute(
    actor: Actor,
    id: string,
    decision: ResidentDecision,
  ): Promise<PortariaEvent> {
    const event = await this.getEvent.execute(actor, id);
    event.respond(actor, decision);
    await this.events.save(event);
    return event;
  }
}
