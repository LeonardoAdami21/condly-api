import { PortariaEvent as PrismaPortariaEvent } from '../../../../generated/prisma/client';
import { PortariaEvent } from '../../domain/entities/portaria-event';

export class PrismaPortariaEventMapper {
  static toDomain(raw: PrismaPortariaEvent): PortariaEvent {
    const { id, ...props } = raw;
    return PortariaEvent.restore(props, id);
  }

  static toPrisma(event: PortariaEvent): PrismaPortariaEvent {
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
