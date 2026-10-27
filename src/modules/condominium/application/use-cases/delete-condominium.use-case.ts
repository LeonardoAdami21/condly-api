import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import { CondominiumRepository } from '../../domain/repositories/condominium-repository';
import { GetCondominiumUseCase } from './get-condominium.use-case';

@Injectable()
export class DeleteCondominiumUseCase {
  constructor(
    private readonly condominiums: CondominiumRepository,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(actor: Actor, id: string): Promise<void> {
    await this.getCondominium.execute(actor, id);
    await this.condominiums.delete(id);
  }
}
