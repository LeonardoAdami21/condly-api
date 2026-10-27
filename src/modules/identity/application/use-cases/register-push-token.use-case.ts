import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import { NotFoundError } from '../../../../shared/domain/errors';
import { UserRepository } from '../../domain/repositories/user-repository';

@Injectable()
export class RegisterPushTokenUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: Actor, fcmToken: string): Promise<void> {
    const user = await this.users.findById(actor.id);
    if (!user) throw new NotFoundError('Usuário não encontrado');
    user.registerPushToken(fcmToken);
    await this.users.save(user);
  }
}
