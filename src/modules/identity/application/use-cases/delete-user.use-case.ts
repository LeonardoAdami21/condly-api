import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import { ValidationError } from '../../../../shared/domain/errors';
import { assertCanManageRole } from '../../domain/policies/role-management.policy';
import { UserRepository } from '../../domain/repositories/user-repository';
import { GetUserUseCase } from './get-user.use-case';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly getUser: GetUserUseCase,
  ) {}

  async execute(actor: Actor, id: string): Promise<void> {
    if (actor.id === id) {
      throw new ValidationError('Não é possível remover o próprio usuário');
    }
    const user = await this.getUser.execute(actor, id);
    assertCanManageRole(actor.role, user.role);
    await this.users.delete(id);
  }
}
