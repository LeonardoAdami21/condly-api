import { Entity } from '../../../../shared/domain/entity';
import {
  ForbiddenError,
  ValidationError,
} from '../../../../shared/domain/errors';
import {
  PortariaEventStatus,
  ResidentDecision,
} from '../enums/portaria-event-status';
import { PortariaEventType } from '../enums/portaria-event-type';

export interface PortariaEventProps {
  externalId: string | null;
  type: PortariaEventType;
  status: PortariaEventStatus;
  personName: string | null;
  personDocument: string | null;
  description: string | null;
  condominiumId: string;
  apartmentId: string;
  respondedById: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterPortariaEventInput {
  externalId?: string | null;
  type: PortariaEventType;
  personName?: string | null;
  personDocument?: string | null;
  description?: string | null;
  condominiumId: string;
  apartmentId: string;
}

/** Visitante, encomenda ou prestador registrado pela portaria. */
export class PortariaEvent extends Entity<PortariaEventProps> {
  static register(input: RegisterPortariaEventInput): PortariaEvent {
    const now = new Date();
    return new PortariaEvent({
      externalId: input.externalId ?? null,
      type: input.type,
      // Encomendas não precisam de autorização do morador
      status:
        input.type === PortariaEventType.ENCOMENDA
          ? PortariaEventStatus.AUTORIZADO
          : PortariaEventStatus.PENDENTE,
      personName: input.personName ?? null,
      personDocument: input.personDocument ?? null,
      description: input.description ?? null,
      condominiumId: input.condominiumId,
      apartmentId: input.apartmentId,
      respondedById: null,
      respondedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: PortariaEventProps, id: string): PortariaEvent {
    return new PortariaEvent(props, id);
  }

  get externalId() {
    return this.props.externalId;
  }
  get type() {
    return this.props.type;
  }
  get status() {
    return this.props.status;
  }
  get personName() {
    return this.props.personName;
  }
  get personDocument() {
    return this.props.personDocument;
  }
  get description() {
    return this.props.description;
  }
  get condominiumId() {
    return this.props.condominiumId;
  }
  get apartmentId() {
    return this.props.apartmentId;
  }
  get respondedById() {
    return this.props.respondedById;
  }
  get respondedAt() {
    return this.props.respondedAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  /** Morador do apartamento autoriza ou nega a entrada. */
  respond(
    resident: { id: string; apartmentId: string | null },
    decision: ResidentDecision,
  ) {
    if (resident.apartmentId !== this.props.apartmentId) {
      throw new ForbiddenError(
        'Apenas moradores do apartamento podem responder',
      );
    }
    if (this.props.status !== PortariaEventStatus.PENDENTE) {
      throw new ValidationError('Evento já foi respondido');
    }

    this.props.status = decision;
    this.props.respondedById = resident.id;
    this.props.respondedAt = new Date();
    this.touch();
  }

  /** Entrada realizada ou encomenda entregue. */
  finalize() {
    if (this.props.status === PortariaEventStatus.NEGADO) {
      throw new ValidationError('Não é possível finalizar um evento negado');
    }
    if (this.props.status === PortariaEventStatus.FINALIZADO) {
      throw new ValidationError('Evento já finalizado');
    }
    this.props.status = PortariaEventStatus.FINALIZADO;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
