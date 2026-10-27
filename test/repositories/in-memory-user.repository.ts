import { User } from '../../src/modules/identity/domain/entities/user';
import {
  UserFilter,
  UserRepository,
} from '../../src/modules/identity/domain/repositories/user-repository';
import { PaginationParams, skipOf } from '../../src/shared/domain/pagination';

export class InMemoryUserRepository implements UserRepository {
  items: User[] = [];

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByEmail(email: string) {
    return this.items.find((item) => item.email.value === email) ?? null;
  }

  async findMany(filter: UserFilter, pagination: PaginationParams) {
    const matches = this.items.filter(
      (item) =>
        (!filter.condominiumId ||
          item.condominiumId === filter.condominiumId) &&
        (!filter.apartmentId || item.apartmentId === filter.apartmentId) &&
        (!filter.role || item.role === filter.role),
    );
    const start = skipOf(pagination);
    return {
      items: matches.slice(start, start + pagination.limit),
      total: matches.length,
    };
  }

  async create(user: User) {
    this.items.push(user);
  }

  async save(user: User) {
    const index = this.items.findIndex((item) => item.equals(user));
    this.items[index] = user;
  }

  async delete(id: string) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
