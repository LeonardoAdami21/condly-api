import { ValidationError } from '../../../../shared/domain/errors';

export interface AddressProps {
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

export class Address {
  private constructor(private readonly props: AddressProps) {}

  static create(input: AddressProps): Address {
    const state = input.state.trim().toUpperCase();
    const zipCode = input.zipCode.replace(/\D/g, '');

    if (!/^[A-Z]{2}$/.test(state)) {
      throw new ValidationError('UF deve conter 2 letras');
    }
    if (!/^\d{8}$/.test(zipCode)) {
      throw new ValidationError('CEP deve conter 8 dígitos');
    }
    for (const field of ['street', 'number', 'district', 'city'] as const) {
      if (!input[field]?.trim()) {
        throw new ValidationError(`Endereço: ${field} é obrigatório`);
      }
    }

    return new Address({ ...input, state, zipCode });
  }

  static restore(props: AddressProps): Address {
    return new Address(props);
  }

  get street() {
    return this.props.street;
  }
  get number() {
    return this.props.number;
  }
  get district() {
    return this.props.district;
  }
  get city() {
    return this.props.city;
  }
  get state() {
    return this.props.state;
  }
  get zipCode() {
    return this.props.zipCode;
  }

  toJSON(): AddressProps {
    return { ...this.props };
  }
}
