import { User as PrismaUser } from '../../../../generated/prisma/client';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.restore(
      {
        name: raw.name,
        email: Email.restore(raw.email),
        passwordHash: raw.password,
        phone: raw.phone,
        role: raw.role,
        fcmToken: raw.fcmToken,
        condominiumId: raw.condominiumId,
        apartmentId: raw.apartmentId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      password: user.passwordHash,
      phone: user.phone,
      role: user.role,
      fcmToken: user.fcmToken,
      condominiumId: user.condominiumId,
      apartmentId: user.apartmentId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
