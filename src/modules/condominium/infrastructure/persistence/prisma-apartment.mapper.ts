import { Apartment as PrismaApartment } from '../../../../generated/prisma/client';
import { Apartment } from '../../domain/entities/apartment';

export class PrismaApartmentMapper {
  static toDomain(raw: PrismaApartment): Apartment {
    return Apartment.restore(
      {
        condominiumId: raw.condominiumId,
        number: raw.number,
        block: raw.block,
        floor: raw.floor,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(apartment: Apartment): PrismaApartment {
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
