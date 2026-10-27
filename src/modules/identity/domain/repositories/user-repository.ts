import { Page, PaginationParams } from '../../../../shared/domain/pagination';
import { Role } from '../../../../shared/domain/role';
import { User } from '../entities/user';

export interface UserFilter {
  condominiumId?: string;
  apartmentId?: string;
  role?: Role;
}

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findMany(
    filter: UserFilter,
    pagination: PaginationParams,
  ): Promise<Page<User>>;
  abstract create(user: User): Promise<void>;
  abstract save(user: User): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
