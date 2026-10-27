import { Injectable } from '@nestjs/common';
import { Actor } from '../../../../shared/application/actor';
import { ConflictError } from '../../../../shared/domain/errors';
import { Role } from '../../../../shared/domain/role';
import { User } from '../../domain/entities/user';
import { assertCanManageRole } from '../../domain/policies/role-management.policy';
import { UserRepository } from '../../domain/repositories/user-repository';
import { Email } from '../../domain/value-objects/email';
import { PasswordHasher } from '../ports/password-hasher';
import { UserAssignmentResolver } from '../services/user-assignment.resolver';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
  condominiumId?: string;
  apartmentId?: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly assignments: UserAssignmentResolver,
  ) {}

  async execute(actor: Actor, input: CreateUserInput): Promise<User> {
    const role = input.role ?? Role.MORADOR;
    assertCanManageRole(actor.role, role);

    const email = Email.create(input.email);
    if (await this.users.findByEmail(email.value)) {
      throw new ConflictError('Email já cadastrado');
    }

    const user = User.create({
      name: input.name,
      email,
      phone: input.phone,
      passwordHash: await this.hasher.hash(input.password),
      ...(await this.assignments.resolve(actor, { ...input, role })),
    });
    await this.users.create(user);
    return user;
  }
}
