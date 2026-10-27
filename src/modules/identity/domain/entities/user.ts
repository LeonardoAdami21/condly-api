import { Entity } from '../../../../shared/domain/entity';
import { ValidationError } from '../../../../shared/domain/errors';
import { Role } from '../../../../shared/domain/role';
import { Email } from '../value-objects/email';

/** Vínculo do usuário com perfil, condomínio e apartamento. */
export interface UserAssignment {
  role: Role;
  condominiumId: string | null;
  apartmentId: string | null;
}

export interface UserProps extends UserAssignment {
  name: string;
  email: Email;
  passwordHash: string;
  phone: string | null;
  fcmToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  static create(
    input: {
      name: string;
      email: Email;
      passwordHash: string;
      phone?: string | null;
    } & UserAssignment,
  ): User {
    const now = new Date();
    return new User({
      name: User.validateName(input.name),
      email: input.email,
      passwordHash: input.passwordHash,
      phone: input.phone ?? null,
      fcmToken: null,
      ...User.validateAssignment(input),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: UserProps, id: string): User {
    return new User(props, id);
  }

  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get passwordHash() {
    return this.props.passwordHash;
  }
  get phone() {
    return this.props.phone;
  }
  get role() {
    return this.props.role;
  }
  get condominiumId() {
    return this.props.condominiumId;
  }
  get apartmentId() {
    return this.props.apartmentId;
  }
  get fcmToken() {
    return this.props.fcmToken;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  get assignment(): UserAssignment {
    const { role, condominiumId, apartmentId } = this.props;
    return { role, condominiumId, apartmentId };
  }

  updateProfile(input: {
    name?: string;
    email?: Email;
    phone?: string | null;
  }) {
    if (input.name !== undefined)
      this.props.name = User.validateName(input.name);
    if (input.email !== undefined) this.props.email = input.email;
    if (input.phone !== undefined) this.props.phone = input.phone;
    this.touch();
  }

  changePassword(passwordHash: string) {
    this.props.passwordHash = passwordHash;
    this.touch();
  }

  reassign(assignment: UserAssignment) {
    Object.assign(this.props, User.validateAssignment(assignment));
    this.touch();
  }

  /** Token do Firebase Cloud Messaging usado para notificações push. */
  registerPushToken(token: string) {
    this.props.fcmToken = token;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  private static validateName(name: string): string {
    const value = name.trim();
    if (value.length < 2) throw new ValidationError('Nome muito curto');
    return value;
  }

  private static validateAssignment({
    role,
    condominiumId,
    apartmentId,
  }: UserAssignment): UserAssignment {
    if (role === Role.ADMIN) {
      return { role, condominiumId: null, apartmentId: null };
    }
    if (!condominiumId) {
      throw new ValidationError('condominiumId é obrigatório');
    }
    if (role === Role.MORADOR && !apartmentId) {
      throw new ValidationError('apartmentId é obrigatório para moradores');
    }
    return { role, condominiumId, apartmentId: apartmentId ?? null };
  }
}
