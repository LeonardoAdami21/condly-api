import { Apartment } from '../../src/modules/condominium/domain/entities/apartment';
import { Condominium } from '../../src/modules/condominium/domain/entities/condominium';
import { Address } from '../../src/modules/condominium/domain/value-objects/address';
import { Cnpj } from '../../src/modules/condominium/domain/value-objects/cnpj';

export function makeCondominium(condlyPortariaId = 'condly-1') {
  return Condominium.create({
    name: 'Residencial Teste',
    cnpj: Cnpj.create('11.222.333/0001-81'),
    address: Address.create({
      street: 'Rua A',
      number: '1',
      district: 'Centro',
      city: 'São Paulo',
      state: 'sp',
      zipCode: '01001-000',
    }),
    condlyPortariaId,
  });
}

export function makeApartment(
  condominiumId: string,
  number = '101',
  block = 'A',
) {
  return Apartment.create({ condominiumId, number, block });
}
