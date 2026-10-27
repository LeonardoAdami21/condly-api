import { ValidationError } from '../../../../shared/domain/errors';
import { Cnpj } from './cnpj';

describe('Cnpj', () => {
  it('normaliza e formata um CNPJ válido', () => {
    const cnpj = Cnpj.create('11.222.333/0001-81');
    expect(cnpj.value).toBe('11222333000181');
    expect(cnpj.formatted).toBe('11.222.333/0001-81');
  });

  it.each(['11.222.333/0001-82', '00000000000000', '123'])(
    'rejeita CNPJ inválido %s',
    (raw) => {
      expect(() => Cnpj.create(raw)).toThrow(ValidationError);
    },
  );
});
