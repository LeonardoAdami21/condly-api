import { Injectable } from '@nestjs/common';
import { UnauthorizedError } from '../../../../shared/domain/errors';
import { User } from '../../domain/entities/user';
import { UserRepository } from '../../domain/repositories/user-repository';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenSigner } from '../ports/token-signer';

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenSigner,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserInput): Promise<{ accessToken: string; user: User }> {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user || !(await this.hasher.compare(password, user.passwordHash))) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    const accessToken = await this.tokens.sign({
      sub: user.id,
      role: user.role,
    });
    return { accessToken, user };
  }
}
