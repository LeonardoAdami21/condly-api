import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertCondominiumAccess, AuthUser } from '../auth/auth-user';
import { paginated } from '../common/dto/pagination.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { Prisma } from '../generated/prisma/client';
import {
  PortariaEventStatus,
  PortariaEventType,
  Role,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortariaEventDto } from './dto/create-portaria-event.dto';
import { ListPortariaEventsDto } from './dto/list-portaria-events.dto';
import { RespondPortariaEventDto } from './dto/respond-portaria-event.dto';

const EVENT_TITLES: Record<PortariaEventType, string> = {
  VISITANTE: 'Visitante na portaria',
  ENCOMENDA: 'Encomenda recebida',
  PRESTADOR_SERVICO: 'Prestador de serviço na portaria',
};

const eventInclude = {
  apartment: { select: { id: true, block: true, number: true } },
} as const;

@Injectable()
export class PortariaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  /** Recebe um evento da portaria Condly e notifica os moradores. */
  async createFromCondly(dto: CreatePortariaEventDto) {
    if (dto.externalId) {
      const existing = await this.prisma.portariaEvent.findUnique({
        where: { externalId: dto.externalId },
        include: eventInclude,
      });
      if (existing) return existing;
    }

    const apartment = await this.prisma.apartment.findFirst({
      where: {
        number: dto.apartmentNumber,
        block: dto.block ?? '',
        condominium: { condlyPortariaId: dto.condlyPortariaId },
      },
      include: {
        residents: {
          where: { fcmToken: { not: null } },
          select: { fcmToken: true },
        },
      },
    });
    if (!apartment) throw new NotFoundException('Apartamento não encontrado');

    const event = await this.prisma.portariaEvent.create({
      data: {
        externalId: dto.externalId,
        type: dto.type,
        personName: dto.personName,
        personDocument: dto.personDocument,
        description: dto.description,
        condominiumId: apartment.condominiumId,
        apartmentId: apartment.id,
        // Encomendas não precisam de autorização do morador
        status:
          dto.type === PortariaEventType.ENCOMENDA
            ? PortariaEventStatus.AUTORIZADO
            : PortariaEventStatus.PENDENTE,
      },
      include: eventInclude,
    });

    await this.firebase.sendToTokens(
      apartment.residents.map((r) => r.fcmToken!),
      {
        title: EVENT_TITLES[event.type],
        body:
          event.personName ?? event.description ?? 'Toque para ver detalhes',
        data: { eventId: event.id, type: event.type, status: event.status },
      },
    );
    return event;
  }

  async findForCondly(id: string) {
    const event = await this.prisma.portariaEvent.findFirst({
      where: { OR: [{ id }, { externalId: id }] },
      include: eventInclude,
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    return event;
  }

  async finalizeFromCondly(id: string) {
    const event = await this.findForCondly(id);
    return this.finalize(event.id);
  }

  /** Apartamentos e moradores de um condomínio para sincronização da portaria. */
  async listApartmentsForCondly(condlyPortariaId: string) {
    const condominium = await this.prisma.condominium.findUnique({
      where: { condlyPortariaId },
      select: {
        id: true,
        name: true,
        apartments: {
          select: {
            id: true,
            block: true,
            number: true,
            residents: { select: { id: true, name: true, phone: true } },
          },
          orderBy: [{ block: 'asc' }, { number: 'asc' }],
        },
      },
    });
    if (!condominium) throw new NotFoundException('Condomínio não encontrado');
    return condominium;
  }

  async findAll(actor: AuthUser, query: ListPortariaEventsDto) {
    const where: Prisma.PortariaEventWhereInput = {
      condominiumId:
        actor.role === Role.ADMIN
          ? query.condominiumId
          : (actor.condominiumId ?? ''),
      apartmentId:
        actor.role === Role.MORADOR
          ? (actor.apartmentId ?? '')
          : query.apartmentId,
      status: query.status,
      type: query.type,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.portariaEvent.findMany({
        where,
        include: eventInclude,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.portariaEvent.count({ where }),
    ]);
    return paginated(data, total, query);
  }

  async findOne(actor: AuthUser, id: string) {
    const event = await this.prisma.portariaEvent.findUnique({
      where: { id },
      include: {
        ...eventInclude,
        respondedBy: { select: { id: true, name: true } },
      },
    });
    if (
      !event ||
      (actor.role === Role.MORADOR && actor.apartmentId !== event.apartmentId)
    ) {
      throw new NotFoundException('Evento não encontrado');
    }
    assertCondominiumAccess(actor, event.condominiumId);
    return event;
  }

  /** Morador autoriza ou nega a entrada. */
  async respond(actor: AuthUser, id: string, dto: RespondPortariaEventDto) {
    const event = await this.findOne(actor, id);
    if (actor.apartmentId !== event.apartmentId) {
      throw new ForbiddenException(
        'Apenas moradores do apartamento podem responder',
      );
    }
    if (event.status !== PortariaEventStatus.PENDENTE) {
      throw new BadRequestException('Evento já foi respondido');
    }

    return this.prisma.portariaEvent.update({
      where: { id },
      data: {
        status: dto.status,
        respondedById: actor.id,
        respondedAt: new Date(),
      },
      include: eventInclude,
    });
  }

  async finalizeByStaff(actor: AuthUser, id: string) {
    await this.findOne(actor, id);
    return this.finalize(id);
  }

  private finalize(id: string) {
    return this.prisma.portariaEvent.update({
      where: { id },
      data: { status: PortariaEventStatus.FINALIZADO },
      include: eventInclude,
    });
  }
}
