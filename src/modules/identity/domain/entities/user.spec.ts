import { ValidationError } from '../../../../shared/domain/errors';
import { Role } from '../../../../shared/domain/role';
import { Email } from '../value-objects/email';
import { User } from './user';

const base = {
  name: 'Maria',
  email: Email.create('Maria@Email.com'),
  passwordHash: 'hash',
};

describe('User', () => {
  it('exige apartamento para moradores', () => {
    expect(() =>
      User.create({
        ...base,
        role: Role.MORADOR,
        condominiumId: 'c1',
        apartmentId: null,
      }),
    ).toThrow(ValidationError);
  });

  it('exige condomínio para porteiros', () => {
    expect(() =>
      User.create({
        ...base,
        role: Role.PORTEIRO,
        condominiumId: null,
        apartmentId: null,
      }),
    ).toThrow(ValidationError);
  });

  it('remove vínculos de administradores', () => {
    const user = User.create({
      ...base,
      role: Role.ADMIN,
      condominiumId: 'c1',
      apartmentId: 'a1',
    });
    expect(user.assignment).toEqual({
      role: Role.ADMIN,
      condominiumId: null,
      apartmentId: null,
    });
    expect(user.email.value).toBe('maria@email.com');
  });
});
