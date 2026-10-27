import { Page, PaginationParams } from '../../../../shared/domain/pagination';
import { Condominium } from '../entities/condominium';

export interface CondominiumFilter {
  id?: string;
}

export abstract class CondominiumRepository {
  abstract findById(id: string): Promise<Condominium | null>;
  abstract findByCnpj(cnpj: string): Promise<Condominium | null>;
  abstract findByCondlyPortariaId(
    condlyPortariaId: string,
  ): Promise<Condominium | null>;
  abstract findMany(
    filter: CondominiumFilter,
    pagination: PaginationParams,
  ): Promise<Page<Condominium>>;
  abstract create(condominium: Condominium): Promise<void>;
  abstract save(condominium: Condominium): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
