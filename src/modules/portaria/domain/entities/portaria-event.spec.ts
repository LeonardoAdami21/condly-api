import {
  ForbiddenError,
  ValidationError,
} from '../../../../shared/domain/errors';
import { PortariaEventStatus } from '../enums/portaria-event-status';
import { PortariaEventType } from '../enums/portaria-event-type';
import { PortariaEvent } from './portaria-event';

const visit = () =>
  PortariaEvent.register({
    type: PortariaEventType.VISITANTE,
    condominiumId: 'c1',
    apartmentId: 'a1',
  });

describe('PortariaEvent', () => {
  it('encomendas já nascem autorizadas e visitas pendentes', () => {
    expect(visit().status).toBe(PortariaEventStatus.PENDENTE);
    expect(
      PortariaEvent.register({
        type: PortariaEventType.ENCOMENDA,
        condominiumId: 'c1',
        apartmentId: 'a1',
      }).status,
    ).toBe(PortariaEventStatus.AUTORIZADO);
  });

  it('morador do apartamento autoriza a visita', () => {
    const event = visit();
    event.respond({ id: 'u1', apartmentId: 'a1' }, 'AUTORIZADO');

    expect(event.status).toBe(PortariaEventStatus.AUTORIZADO);
    expect(event.respondedById).toBe('u1');
    expect(event.respondedAt).toBeInstanceOf(Date);
  });

  it('morador de outro apartamento não pode responder', () => {
    expect(() =>
      visit().respond({ id: 'u2', apartmentId: 'a2' }, 'AUTORIZADO'),
    ).toThrow(ForbiddenError);
  });

  it('não permite responder duas vezes', () => {
    const event = visit();
    event.respond({ id: 'u1', apartmentId: 'a1' }, 'NEGADO');
    expect(() =>
      event.respond({ id: 'u1', apartmentId: 'a1' }, 'AUTORIZADO'),
    ).toThrow(ValidationError);
  });

  it('não finaliza evento negado', () => {
    const event = visit();
    event.respond({ id: 'u1', apartmentId: 'a1' }, 'NEGADO');
    expect(() => event.finalize()).toThrow(ValidationError);
  });
});
