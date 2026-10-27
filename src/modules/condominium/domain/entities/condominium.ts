import { Entity } from '../../../../shared/domain/entity';
import { ValidationError } from '../../../../shared/domain/errors';
import { Address } from '../value-objects/address';
import { Cnpj } from '../value-objects/cnpj';

export interface CondominiumProps {
  name: string;
  cnpj: Cnpj;
  address: Address;
  condlyPortariaId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Condominium extends Entity<CondominiumProps> {
  static create(
    input: Pick<CondominiumProps, 'name' | 'cnpj' | 'address'> & {
      condlyPortariaId?: string | null;
    },
  ): Condominium {
    const now = new Date();
    return new Condominium({
      name: Condominium.validateName(input.name),
      cnpj: input.cnpj,
      address: input.address,
      condlyPortariaId: input.condlyPortariaId ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: CondominiumProps, id: string): Condominium {
    return new Condominium(props, id);
  }

  get name() {
    return this.props.name;
  }
  get cnpj() {
    return this.props.cnpj;
  }
  get address() {
    return this.props.address;
  }
  get condlyPortariaId() {
    return this.props.condlyPortariaId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  rename(name: string) {
    this.props.name = Condominium.validateName(name);
    this.touch();
  }

  changeCnpj(cnpj: Cnpj) {
    this.props.cnpj = cnpj;
    this.touch();
  }

  relocate(address: Address) {
    this.props.address = address;
    this.touch();
  }

  /** Vincula o condomínio ao cadastro do sistema de portaria Condly. */
  linkToCondly(condlyPortariaId: string | null) {
    this.props.condlyPortariaId = condlyPortariaId?.trim() || null;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  private static validateName(name: string): string {
    const value = name.trim();
    if (value.length < 2) throw new ValidationError('Nome muito curto');
    return value;
  }
}
