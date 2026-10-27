import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import { ApartmentRepository } from '../../domain/repositories/apartment-repository';
import { GetApartmentUseCase } from './get-apartment.use-case';

@Injectable()
export class DeleteApartmentUseCase {
  constructor(
    private readonly apartments: ApartmentRepository,
    private readonly getApartment: GetApartmentUseCase,
  ) {}

  async execute(actor: Actor, id: string): Promise<void> {
    await this.getApartment.execute(actor, id);
    await this.apartments.delete(id);
  }
}
