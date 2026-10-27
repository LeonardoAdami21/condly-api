import { Condominium } from '../../domain/entities/condominium';

export class CondominiumPresenter {
  static toHTTP(condominium: Condominium) {
    return {
      id: condominium.id,
      name: condominium.name,
      cnpj: condominium.cnpj.formatted,
      ...condominium.address.toJSON(),
      condlyPortariaId: condominium.condlyPortariaId,
      createdAt: condominium.createdAt,
      updatedAt: condominium.updatedAt,
    };
  }
}
