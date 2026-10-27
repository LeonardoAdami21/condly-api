import { Apartment } from '../../src/modules/condominium/domain/entities/apartment';
import {
  ApartmentFilter,
  ApartmentRepository,
} from '../../src/modules/condominium/domain/repositories/apartment-repository';
import { PaginationParams, skipOf } from '../../src/shared/domain/pagination';

export class InMemoryApartmentRepository implements ApartmentRepository {
  items: Apartment[] = [];

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByUnit(condominiumId: string, block: string, number: string) {
    return (
      this.items.find(
        (item) =>
          item.condominiumId === condominiumId &&
          item.block === block &&
          item.number === number,
      ) ?? null
    );
  }

  async findMany(filter: ApartmentFilter, pagination: PaginationParams) {
    const matches = this.items.filter(
      (item) =>
        (!filter.id || item.id === filter.id) &&
        (!filter.condominiumId ||
          item.condominiumId === filter.condominiumId) &&
        (!filter.block || item.block === filter.block),
    );
    const start = skipOf(pagination);
    return {
      items: matches.slice(start, start + pagination.limit),
      total: matches.length,
    };
  }

  async create(apartment: Apartment) {
    this.items.push(apartment);
  }

  async save(apartment: Apartment) {
    const index = this.items.findIndex((item) => item.equals(apartment));
    this.items[index] = apartment;
  }

  async delete(id: string) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
