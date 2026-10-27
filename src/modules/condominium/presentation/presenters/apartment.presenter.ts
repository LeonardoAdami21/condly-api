import { Apartment } from '../../domain/entities/apartment';

export class ApartmentPresenter {
  static toHTTP(apartment: Apartment) {
    return {
      id: apartment.id,
      condominiumId: apartment.condominiumId,
      number: apartment.number,
      block: apartment.block,
      floor: apartment.floor,
      createdAt: apartment.createdAt,
      updatedAt: apartment.updatedAt,
    };
  }
}
