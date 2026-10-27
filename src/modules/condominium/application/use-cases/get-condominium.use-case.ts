import { Injectable } from '@nestjs/common';
import {
  Actor,
  assertCondominiumAccess,
} from '../../../../shared/application/actor';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Condominium } from '../../domain/entities/condominium';
import { CondominiumRepository } from '../../domain/repositories/condominium-repository';

@Injectable()
export class GetCondominiumUseCase {
  constructor(private readonly condominiums: CondominiumRepository) {}

  async execute(actor: Actor, id: string): Promise<Condominium> {
    assertCondominiumAccess(actor, id);
    const condominium = await this.condominiums.findById(id);
    if (!condominium) throw new NotFoundError('Condomínio não encontrado');
    return condominium;
  }
}
