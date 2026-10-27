import { Injectable } from '@nestjs/common';
import { Actor, condominiumScope } from '../../../../shared/application/actor';
import {
  emptyPage,
  paginate,
  Paginated,
} from '../../../../shared/application/pagination';
import { PaginationParams } from '../../../../shared/domain/pagination';
import { User } from '../../domain/entities/user';
import {
  UserFilter,
  UserRepository,
} from '../../domain/repositories/user-repository';

export type ListUsersInput = PaginationParams & UserFilter;

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(
    actor: Actor,
    { condominiumId, apartmentId, role, ...pagination }: ListUsersInput,
  ): Promise<Paginated<User>> {
    const scope = condominiumScope(actor, condominiumId);
    if (!scope) return emptyPage(pagination);

    const page = await this.users.findMany(
      { ...scope, apartmentId, role },
      pagination,
    );
    return paginate(page, pagination);
  }
}
