import { PortariaEvent } from '../../domain/entities/portaria-event';

export class PortariaEventPresenter {
  static toHTTP(event: PortariaEvent) {
    return {
      id: event.id,
      externalId: event.externalId,
      type: event.type,
      status: event.status,
      personName: event.personName,
      personDocument: event.personDocument,
      description: event.description,
      condominiumId: event.condominiumId,
      apartmentId: event.apartmentId,
      respondedById: event.respondedById,
      respondedAt: event.respondedAt,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
