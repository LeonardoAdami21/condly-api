import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import { ConflictError } from '../../../../shared/domain/errors';
import { Apartment } from '../../domain/entities/apartment';
import { ApartmentRepository } from '../../domain/repositories/apartment-repository';
import { GetApartmentUseCase } from './get-apartment.use-case';

export interface UpdateApartmentInput {
  number?: string;
  block?: string;
  floor?: number;
}

@Injectable()
export class UpdateApartmentUseCase {
  constructor(
    private readonly apartments: ApartmentRepository,
    private readonly getApartment: GetApartmentUseCase,
  ) {}

  async execute(
    actor: Actor,
    id: string,
    input: UpdateApartmentInput,
  ): Promise<Apartment> {
    const apartment = await this.getApartment.execute(actor, id);

    if (input.number !== undefined || input.block !== undefined) {
      apartment.changeUnit({
        number: input.number ?? apartment.number,
        block: input.block ?? apartment.block,
      });
      const owner = await this.apartments.findByUnit(
        apartment.condominiumId,
        apartment.block,
        apartment.number,
      );
      if (owner && !owner.equals(apartment)) {
        throw new ConflictError(
          'Já existe um apartamento com este número e bloco no condomínio',
        );
      }
    }
    if (input.floor !== undefined) apartment.changeFloor(input.floor);

    await this.apartments.save(apartment);
    return apartment;
  }
}
