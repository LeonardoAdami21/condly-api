import { Injectable } from '@nestjs/common';
import {
  Actor,
  assertCondominiumAccess,
} from '../../../../shared/application/actor';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Role } from '../../../../shared/domain/role';
import { Apartment } from '../../domain/entities/apartment';
import { ApartmentRepository } from '../../domain/repositories/apartment-repository';

@Injectable()
export class GetApartmentUseCase {
  constructor(private readonly apartments: ApartmentRepository) {}

  async execute(actor: Actor, id: string): Promise<Apartment> {
    const apartment = await this.apartments.findById(id);
    if (
      !apartment ||
      (actor.role === Role.MORADOR && actor.apartmentId !== id)
    ) {
      throw new NotFoundError('Apartamento não encontrado');
    }
    assertCondominiumAccess(actor, apartment.condominiumId);
    return apartment;
  }
}
