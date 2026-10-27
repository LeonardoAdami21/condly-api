import { Injectable } from '@nestjs/common';
import {
  Actor,
  assertCondominiumAccess,
} from '../../../../shared/application/actor';
import { NotFoundError } from '../../../../shared/domain/errors';
import { User } from '../../domain/entities/user';
import { UserRepository } from '../../domain/repositories/user-repository';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: Actor, id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError('Usuário não encontrado');
    if (actor.id !== id) assertCondominiumAccess(actor, user.condominiumId);
    return user;
  }
}
