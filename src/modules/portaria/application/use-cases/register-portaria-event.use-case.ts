import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Apartment } from '../../../condominium/domain/entities/apartment';
import { ApartmentRepository } from '../../../condominium/domain/repositories/apartment-repository';
import { CondominiumRepository } from '../../../condominium/domain/repositories/condominium-repository';
import { PortariaEvent } from '../../domain/entities/portaria-event';
import { PortariaEventType } from '../../domain/enums/portaria-event-type';
import { PortariaEventRepository } from '../../domain/repositories/portaria-event-repository';
import { ResidentNotifier } from '../ports/resident-notifier';

export interface RegisterPortariaEventInput {
  externalId?: string;
  condlyPortariaId: string;
  block?: string;
  apartmentNumber: string;
  type: PortariaEventType;
  personName?: string;
  personDocument?: string;
  description?: string;
}

const NOTIFICATION_TITLES: Record<PortariaEventType, string> = {
  VISITANTE: 'Visitante na portaria',
  ENCOMENDA: 'Encomenda recebida',
  PRESTADOR_SERVICO: 'Prestador de serviço na portaria',
};

/** Recebe um evento da portaria Condly e notifica os moradores. */
@Injectable()
export class RegisterPortariaEventUseCase {
  constructor(
    private readonly events: PortariaEventRepository,
    private readonly condominiums: CondominiumRepository,
    private readonly apartments: ApartmentRepository,
    private readonly notifier: ResidentNotifier,
  ) {}

  async execute(input: RegisterPortariaEventInput): Promise<PortariaEvent> {
    if (input.externalId) {
      const existing = await this.events.findByExternalId(input.externalId);
      if (existing) return existing;
    }

    const condominium = await this.condominiums.findByCondlyPortariaId(
      input.condlyPortariaId,
    );
    if (!condominium) throw new NotFoundError('Condomínio não encontrado');

    const unit = Apartment.normalizeUnit({
      number: input.apartmentNumber,
      block: input.block,
    });
    const apartment = await this.apartments.findByUnit(
      condominium.id,
      unit.block,
      unit.number,
    );
    if (!apartment) throw new NotFoundError('Apartamento não encontrado');

    const event = PortariaEvent.register({
      ...input,
      condominiumId: condominium.id,
      apartmentId: apartment.id,
    });
    await this.events.create(event);

    await this.notifier.notifyApartment(apartment.id, {
      title: NOTIFICATION_TITLES[event.type],
      body: event.personName ?? event.description ?? 'Toque para ver detalhes',
      data: { eventId: event.id, type: event.type, status: event.status },
    });
    return event;
  }
}
