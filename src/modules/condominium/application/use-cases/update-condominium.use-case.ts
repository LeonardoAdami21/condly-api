import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import { ConflictError } from '../../../../shared/domain/errors';
import { Condominium } from '../../domain/entities/condominium';
import { CondominiumRepository } from '../../domain/repositories/condominium-repository';
import { Address } from '../../domain/value-objects/address';
import { Cnpj } from '../../domain/value-objects/cnpj';
import { CreateCondominiumInput } from './create-condominium.use-case';
import { GetCondominiumUseCase } from './get-condominium.use-case';

export type UpdateCondominiumInput = Partial<CreateCondominiumInput>;

@Injectable()
export class UpdateCondominiumUseCase {
  constructor(
    private readonly condominiums: CondominiumRepository,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(
    actor: Actor,
    id: string,
    input: UpdateCondominiumInput,
  ): Promise<Condominium> {
    const condominium = await this.getCondominium.execute(actor, id);

    if (input.name !== undefined) condominium.rename(input.name);

    if (input.cnpj !== undefined) {
      const cnpj = Cnpj.create(input.cnpj);
      const owner = await this.condominiums.findByCnpj(cnpj.value);
      if (owner && !owner.equals(condominium)) {
        throw new ConflictError('CNPJ já cadastrado');
      }
      condominium.changeCnpj(cnpj);
    }

    if (input.condlyPortariaId !== undefined) {
      const owner = input.condlyPortariaId
        ? await this.condominiums.findByCondlyPortariaId(input.condlyPortariaId)
        : null;
      if (owner && !owner.equals(condominium)) {
        throw new ConflictError('ID da portaria Condly já vinculado');
      }
      condominium.linkToCondly(input.condlyPortariaId);
    }

    const addressFields = [
      'street',
      'number',
      'district',
      'city',
      'state',
      'zipCode',
    ] as const;
    if (addressFields.some((field) => input[field] !== undefined)) {
      condominium.relocate(
        Address.create({
          ...condominium.address.toJSON(),
          ...definedOnly(input),
        }),
      );
    }

    await this.condominiums.save(condominium);
    return condominium;
  }
}

function definedOnly<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
