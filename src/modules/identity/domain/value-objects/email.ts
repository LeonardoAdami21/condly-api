import { ValidationError } from '../../../../shared/domain/errors';

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const value = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new ValidationError('Email inválido');
    }
    return new Email(value);
  }

  static restore(value: string): Email {
    return new Email(value);
  }

  equals(other: Email): boolean {
    return other.value === this.value;
  }
}
