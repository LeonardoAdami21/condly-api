import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import { ConflictError } from '../../../../shared/domain/errors';
import { User } from '../../domain/entities/user';
import { assertCanManageRole } from '../../domain/policies/role-management.policy';
import { UserRepository } from '../../domain/repositories/user-repository';
import { Email } from '../../domain/value-objects/email';
import { PasswordHasher } from '../ports/password-hasher';
import { UserAssignmentResolver } from '../services/user-assignment.resolver';
import { CreateUserInput } from './create-user.use-case';
import { GetUserUseCase } from './get-user.use-case';

export type UpdateUserInput = Partial<CreateUserInput>;

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly assignments: UserAssignmentResolver,
    private readonly getUser: GetUserUseCase,
  ) {}

  async execute(
    actor: Actor,
    id: string,
    input: UpdateUserInput,
  ): Promise<User> {
    const user = await this.getUser.execute(actor, id);
    assertCanManageRole(actor.role, user.role);

    let email: Email | undefined;
    if (input.email !== undefined) {
      email = Email.create(input.email);
      const owner = await this.users.findByEmail(email.value);
      if (owner && !owner.equals(user)) {
        throw new ConflictError('Email já cadastrado');
      }
    }
    user.updateProfile({ name: input.name, email, phone: input.phone });

    if (input.password) {
      user.changePassword(await this.hasher.hash(input.password));
    }

    if (input.role || input.condominiumId || input.apartmentId) {
      const role = input.role ?? user.role;
      assertCanManageRole(actor.role, role);
      user.reassign(
        await this.assignments.resolve(actor, {
          role,
          condominiumId: input.condominiumId ?? user.condominiumId,
          apartmentId: input.apartmentId ?? user.apartmentId,
        }),
      );
    }

    await this.users.save(user);
    return user;
  }
}
