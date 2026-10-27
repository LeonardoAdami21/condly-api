import { User } from '../../domain/entities/user';

export class UserPresenter {
  static toHTTP(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      phone: user.phone,
      role: user.role,
      condominiumId: user.condominiumId,
      apartmentId: user.apartmentId,
      hasPushToken: !!user.fcmToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
