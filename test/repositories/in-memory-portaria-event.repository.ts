import { PortariaEvent } from '../../src/modules/portaria/domain/entities/portaria-event';
import {
  PortariaEventFilter,
  PortariaEventRepository,
} from '../../src/modules/portaria/domain/repositories/portaria-event-repository';
import { PaginationParams, skipOf } from '../../src/shared/domain/pagination';

export class InMemoryPortariaEventRepository implements PortariaEventRepository {
  items: PortariaEvent[] = [];

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByExternalId(externalId: string) {
    return this.items.find((item) => item.externalId === externalId) ?? null;
  }

  async findByReference(reference: string) {
    return (
      this.items.find(
        (item) => item.id === reference || item.externalId === reference,
      ) ?? null
    );
  }

  async findMany(filter: PortariaEventFilter, pagination: PaginationParams) {
    const matches = this.items.filter(
      (item) =>
        (!filter.condominiumId ||
          item.condominiumId === filter.condominiumId) &&
        (!filter.apartmentId || item.apartmentId === filter.apartmentId) &&
        (!filter.status || item.status === filter.status) &&
        (!filter.type || item.type === filter.type),
    );
    const start = skipOf(pagination);
    return {
      items: matches.slice(start, start + pagination.limit),
      total: matches.length,
    };
  }

  async create(event: PortariaEvent) {
    this.items.push(event);
  }

  async save(event: PortariaEvent) {
    const index = this.items.findIndex((item) => item.equals(event));
    this.items[index] = event;
  }
}
