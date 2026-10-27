import { Injectable } from '@nestjs/common';
import { ConflictError } from '../../../../shared/domain/errors';
import { Condominium } from '../../domain/entities/condominium';
import { CondominiumRepository } from '../../domain/repositories/condominium-repository';
import { Address, AddressProps } from '../../domain/value-objects/address';
import { Cnpj } from '../../domain/value-objects/cnpj';

export interface CreateCondominiumInput extends AddressProps {
  name: string;
  cnpj: string;
  condlyPortariaId?: string;
}

@Injectable()
export class CreateCondominiumUseCase {
  constructor(private readonly condominiums: CondominiumRepository) {}

  async execute(input: CreateCondominiumInput): Promise<Condominium> {
    const cnpj = Cnpj.create(input.cnpj);
    if (await this.condominiums.findByCnpj(cnpj.value)) {
      throw new ConflictError('CNPJ já cadastrado');
    }
    if (
      input.condlyPortariaId &&
      (await this.condominiums.findByCondlyPortariaId(input.condlyPortariaId))
    ) {
      throw new ConflictError('ID da portaria Condly já vinculado');
    }

    const condominium = Condominium.create({
      name: input.name,
      cnpj,
      address: Address.create(input),
      condlyPortariaId: input.condlyPortariaId,
    });
    await this.condominiums.create(condominium);
    return condominium;
  }
}
