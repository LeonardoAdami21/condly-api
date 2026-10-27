import { Page, PaginationParams } from '../../../../shared/domain/pagination';
import { Apartment } from '../entities/apartment';

export interface ApartmentFilter {
  id?: string;
  condominiumId?: string;
  block?: string;
}

export abstract class ApartmentRepository {
  abstract findById(id: string): Promise<Apartment | null>;
  abstract findByUnit(
    condominiumId: string,
    block: string,
    number: string,
  ): Promise<Apartment | null>;
  abstract findMany(
    filter: ApartmentFilter,
    pagination: PaginationParams,
  ): Promise<Page<Apartment>>;
  abstract create(apartment: Apartment): Promise<void>;
  abstract save(apartment: Apartment): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
