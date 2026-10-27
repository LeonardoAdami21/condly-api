import { Page, PaginationParams } from '../../../../shared/domain/pagination';
import { PortariaEvent } from '../entities/portaria-event';
import { PortariaEventStatus } from '../enums/portaria-event-status';
import { PortariaEventType } from '../enums/portaria-event-type';

export interface PortariaEventFilter {
  condominiumId?: string;
  apartmentId?: string;
  status?: PortariaEventStatus;
  type?: PortariaEventType;
}

export abstract class PortariaEventRepository {
  abstract findById(id: string): Promise<PortariaEvent | null>;
  abstract findByExternalId(externalId: string): Promise<PortariaEvent | null>;
  /** Busca pelo id interno ou pelo externalId da portaria Condly. */
  abstract findByReference(reference: string): Promise<PortariaEvent | null>;
  abstract findMany(
    filter: PortariaEventFilter,
    pagination: PaginationParams,
  ): Promise<Page<PortariaEvent>>;
  abstract create(event: PortariaEvent): Promise<void>;
  abstract save(event: PortariaEvent): Promise<void>;
}
