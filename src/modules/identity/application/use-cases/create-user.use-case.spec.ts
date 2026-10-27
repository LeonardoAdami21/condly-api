import { InMemoryApartmentRepository } from '../../../../../test/repositories/in-memory-apartment.repository';
import { InMemoryCondominiumRepository } from '../../../../../test/repositories/in-memory-condominium.repository';
import { InMemoryUserRepository } from '../../../../../test/repositories/in-memory-user.repository';
import {
  makeApartment,
  makeCondominium,
} from '../../../../../test/factories/make-condominium';
import { Actor } from '../../../../shared/application/actor';
import {
  ConflictError,
  ForbiddenError,
} from '../../../../shared/domain/errors';
import { Role } from '../../../../shared/domain/role';
import { PasswordHasher } from '../ports/password-hasher';
import { UserAssignmentResolver } from '../services/user-assignment.resolver';
import { CreateUserUseCase } from './create-user.use-case';

class FakeHasher implements PasswordHasher {
  async hash(plain: string) {
    return `hashed:${plain}`;
  }
  async compare(plain: string, hash: string) {
    return hash === `hashed:${plain}`;
  }
}

describe('CreateUserUseCase', () => {
  let users: InMemoryUserRepository;
  let condominiums: InMemoryCondominiumRepository;
  let apartments: InMemoryApartmentRepository;
  let sut: CreateUserUseCase;
  let sindico: Actor;
  let apartmentId: string;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    condominiums = new InMemoryCondominiumRepository();
    apartments = new InMemoryApartmentRepository();
    sut = new CreateUserUseCase(
      users,
      new FakeHasher(),
      new UserAssignmentResolver(condominiums, apartments),
    );

    const condominium = makeCondominium();
    const apartment = makeApartment(condominium.id);
    await condominiums.create(condominium);
    await apartments.create(apartment);
    apartmentId = apartment.id;
    sindico = {
      id: 'sindico-1',
      role: Role.SINDICO,
      condominiumId: condominium.id,
      apartmentId: null,
    };
  });

  it('cadastra morador no condomínio do apartamento com senha hasheada', async () => {
    const user = await sut.execute(sindico, {
      name: 'João',
      email: 'joao@email.com',
      password: 'senha123',
      apartmentId,
    });

    expect(user.role).toBe(Role.MORADOR);
    expect(user.condominiumId).toBe(sindico.condominiumId);
    expect(user.passwordHash).toBe('hashed:senha123');
    expect(users.items).toHaveLength(1);
  });

  it('impede síndico de cadastrar administradores', async () => {
    await expect(
      sut.execute(sindico, {
        name: 'Hacker',
        email: 'x@email.com',
        password: 'senha123',
        role: Role.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('impede síndico de cadastrar em outro condomínio', async () => {
    const other = makeCondominium('condly-2');
    const otherApartment = makeApartment(other.id);
    await condominiums.create(other);
    await apartments.create(otherApartment);

    await expect(
      sut.execute(sindico, {
        name: 'João',
        email: 'joao@email.com',
        password: 'senha123',
        apartmentId: otherApartment.id,
      }),
    ).rejects.toThrow();
  });

  it('rejeita email duplicado', async () => {
    const input = {
      name: 'João',
      email: 'joao@email.com',
      password: 'senha123',
      apartmentId,
    };
    await sut.execute(sindico, input);
    await expect(
      sut.execute(sindico, { ...input, email: 'JOAO@email.com' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
