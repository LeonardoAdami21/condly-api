import { Entity } from '../../../../shared/domain/entity';
import { ValidationError } from '../../../../shared/domain/errors';

export interface ApartmentProps {
  condominiumId: string;
  number: string;
  block: string;
  floor: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApartmentUnit {
  number: string;
  block?: string | null;
}

export class Apartment extends Entity<ApartmentProps> {
  static create(
    input: { condominiumId: string; floor?: number | null } & ApartmentUnit,
  ): Apartment {
    const now = new Date();
    return new Apartment({
      condominiumId: input.condominiumId,
      ...Apartment.normalizeUnit(input),
      floor: input.floor ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ApartmentProps, id: string): Apartment {
    return new Apartment(props, id);
  }

  /** Bloco vazio representa condomínios sem divisão em blocos/torres. */
  static normalizeUnit(unit: ApartmentUnit) {
    const number = unit.number.trim();
    if (!number)
      throw new ValidationError('Número do apartamento é obrigatório');
    return { number, block: unit.block?.trim().toUpperCase() ?? '' };
  }

  get condominiumId() {
    return this.props.condominiumId;
  }
  get number() {
    return this.props.number;
  }
  get block() {
    return this.props.block;
  }
  get floor() {
    return this.props.floor;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  changeUnit(unit: ApartmentUnit) {
    Object.assign(this.props, Apartment.normalizeUnit(unit));
    this.touch();
  }

  changeFloor(floor: number | null) {
    this.props.floor = floor;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
