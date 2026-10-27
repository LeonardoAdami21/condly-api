import { Condominium as PrismaCondominium } from '../../../../generated/prisma/client';
import { Condominium } from '../../domain/entities/condominium';
import { Address } from '../../domain/value-objects/address';
import { Cnpj } from '../../domain/value-objects/cnpj';

export class PrismaCondominiumMapper {
  static toDomain(raw: PrismaCondominium): Condominium {
    return Condominium.restore(
      {
        name: raw.name,
        cnpj: Cnpj.restore(raw.cnpj),
        address: Address.restore({
          street: raw.street,
          number: raw.number,
          district: raw.district,
          city: raw.city,
          state: raw.state,
          zipCode: raw.zipCode,
        }),
        condlyPortariaId: raw.condlyPortariaId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(condominium: Condominium): PrismaCondominium {
    return {
      id: condominium.id,
      name: condominium.name,
      cnpj: condominium.cnpj.value,
      ...condominium.address.toJSON(),
      condlyPortariaId: condominium.condlyPortariaId,
      createdAt: condominium.createdAt,
      updatedAt: condominium.updatedAt,
    };
  }
}
