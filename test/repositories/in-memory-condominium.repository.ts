import { Condominium } from '../../src/modules/condominium/domain/entities/condominium';
import {
  CondominiumFilter,
  CondominiumRepository,
} from '../../src/modules/condominium/domain/repositories/condominium-repository';
import { PaginationParams, skipOf } from '../../src/shared/domain/pagination';

export class InMemoryCondominiumRepository implements CondominiumRepository {
  items: Condominium[] = [];

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByCnpj(cnpj: string) {
    return this.items.find((item) => item.cnpj.value === cnpj) ?? null;
  }

  async findByCondlyPortariaId(condlyPortariaId: string) {
    return (
      this.items.find((item) => item.condlyPortariaId === condlyPortariaId) ??
      null
    );
  }

  async findMany(filter: CondominiumFilter, pagination: PaginationParams) {
    const matches = this.items.filter(
      (item) => !filter.id || item.id === filter.id,
    );
    const start = skipOf(pagination);
    return {
      items: matches.slice(start, start + pagination.limit),
      total: matches.length,
    };
  }

  async create(condominium: Condominium) {
    this.items.push(condominium);
  }

  async save(condominium: Condominium) {
    const index = this.items.findIndex((item) => item.equals(condominium));
    this.items[index] = condominium;
  }

  async delete(id: string) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
