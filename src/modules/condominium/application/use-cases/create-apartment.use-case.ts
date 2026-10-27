import { Injectable } from '@nestjs/common';
import {
  Actor,
  assertCondominiumAccess,
} from '../../../../shared/application/actor';
import { ConflictError, NotFoundError } from '../../../../shared/domain/errors';
import { Apartment } from '../../domain/entities/apartment';
import { ApartmentRepository } from '../../domain/repositories/apartment-repository';
import { CondominiumRepository } from '../../domain/repositories/condominium-repository';

export interface CreateApartmentInput {
  condominiumId: string;
  number: string;
  block?: string;
  floor?: number;
}

@Injectable()
export class CreateApartmentUseCase {
  constructor(
    private readonly apartments: ApartmentRepository,
    private readonly condominiums: CondominiumRepository,
  ) {}

  async execute(actor: Actor, input: CreateApartmentInput): Promise<Apartment> {
    assertCondominiumAccess(actor, input.condominiumId);
    if (!(await this.condominiums.findById(input.condominiumId))) {
      throw new NotFoundError('Condomínio não encontrado');
    }

    const apartment = Apartment.create(input);
    const duplicated = await this.apartments.findByUnit(
      apartment.condominiumId,
      apartment.block,
      apartment.number,
    );
    if (duplicated) {
      throw new ConflictError(
        'Já existe um apartamento com este número e bloco no condomínio',
      );
    }

    await this.apartments.create(apartment);
    return apartment;
  }
}
