import { ValidationError } from '../../../../shared/domain/errors';

export class Cnpj {
  private constructor(readonly value: string) {}

  static create(raw: string): Cnpj {
    const digits = raw.replace(/\D/g, '');
    if (!Cnpj.isValid(digits)) throw new ValidationError('CNPJ inválido');
    return new Cnpj(digits);
  }

  /** Reconstrói a partir de um valor já validado (ex.: banco de dados). */
  static restore(value: string): Cnpj {
    return new Cnpj(value);
  }

  get formatted(): string {
    return this.value.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    );
  }

  equals(other: Cnpj): boolean {
    return other.value === this.value;
  }

  private static isValid(digits: string): boolean {
    if (!/^\d{14}$/.test(digits) || /^(\d)\1{13}$/.test(digits)) return false;

    const checkDigit = (length: number) => {
      const weights =
        length === 12
          ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
          : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const sum = weights.reduce((acc, w, i) => acc + Number(digits[i]) * w, 0);
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };

    return (
      checkDigit(12) === Number(digits[12]) &&
      checkDigit(13) === Number(digits[13])
    );
  }
}
