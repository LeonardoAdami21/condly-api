import {
  makeApartment,
  makeCondominium,
} from '../../../../../test/factories/make-condominium';
import { InMemoryApartmentRepository } from '../../../../../test/repositories/in-memory-apartment.repository';
import { InMemoryCondominiumRepository } from '../../../../../test/repositories/in-memory-condominium.repository';
import { InMemoryPortariaEventRepository } from '../../../../../test/repositories/in-memory-portaria-event.repository';
import { NotFoundError } from '../../../../shared/domain/errors';
import { PortariaEventType } from '../../domain/enums/portaria-event-type';
import {
  ResidentNotification,
  ResidentNotifier,
} from '../ports/resident-notifier';
import { RegisterPortariaEventUseCase } from './register-portaria-event.use-case';

class FakeNotifier implements ResidentNotifier {
  sent: { apartmentId: string; notification: ResidentNotification }[] = [];

  async notifyApartment(
    apartmentId: string,
    notification: ResidentNotification,
  ) {
    this.sent.push({ apartmentId, notification });
  }
}

describe('RegisterPortariaEventUseCase', () => {
  let events: InMemoryPortariaEventRepository;
  let notifier: FakeNotifier;
  let sut: RegisterPortariaEventUseCase;
  let apartmentId: string;

  beforeEach(async () => {
    events = new InMemoryPortariaEventRepository();
    notifier = new FakeNotifier();
    const condominiums = new InMemoryCondominiumRepository();
    const apartments = new InMemoryApartmentRepository();
    sut = new RegisterPortariaEventUseCase(
      events,
      condominiums,
      apartments,
      notifier,
    );

    const condominium = makeCondominium('condly-1');
    const apartment = makeApartment(condominium.id, '101', 'A');
    await condominiums.create(condominium);
    await apartments.create(apartment);
    apartmentId = apartment.id;
  });

  it('registra o evento e notifica os moradores do apartamento', async () => {
    const event = await sut.execute({
      condlyPortariaId: 'condly-1',
      block: 'a',
      apartmentNumber: '101',
      type: PortariaEventType.VISITANTE,
      personName: 'Carlos',
    });

    expect(event.apartmentId).toBe(apartmentId);
    expect(events.items).toHaveLength(1);
    expect(notifier.sent).toEqual([
      expect.objectContaining({
        apartmentId,
        notification: expect.objectContaining({
          title: 'Visitante na portaria',
          body: 'Carlos',
        }),
      }),
    ]);
  });

  it('é idempotente pelo externalId', async () => {
    const input = {
      externalId: 'ext-1',
      condlyPortariaId: 'condly-1',
      block: 'A',
      apartmentNumber: '101',
      type: PortariaEventType.ENCOMENDA,
    };
    const first = await sut.execute(input);
    const second = await sut.execute(input);

    expect(second.id).toBe(first.id);
    expect(events.items).toHaveLength(1);
    expect(notifier.sent).toHaveLength(1);
  });

  it('falha quando o apartamento não existe', async () => {
    await expect(
      sut.execute({
        condlyPortariaId: 'condly-1',
        apartmentNumber: '999',
        type: PortariaEventType.VISITANTE,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
