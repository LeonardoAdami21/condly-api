import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertCondominiumAccess, AuthUser } from '../auth/auth-user';
import { paginated } from '../common/dto/pagination.dto';
import { Prisma } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { ListApartmentsDto } from './dto/list-apartments.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

const residentsSelect = {
  residents: { select: { id: true, name: true, email: true, phone: true } },
} as const;

@Injectable()
export class ApartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actor: AuthUser, dto: CreateApartmentDto) {
    assertCondominiumAccess(actor, dto.condominiumId);
    const exists = await this.prisma.condominium.count({
      where: { id: dto.condominiumId },
    });
    if (!exists) throw new NotFoundException('Condomínio não encontrado');

    return this.prisma.apartment
      .create({
        data: {
          condominiumId: dto.condominiumId,
          number: dto.number,
          block: dto.block ?? '',
          floor: dto.floor,
        },
      })
      .catch(this.handleUniqueError);
  }

  async findAll(actor: AuthUser, query: ListApartmentsDto) {
    const where: Prisma.ApartmentWhereInput = {
      condominiumId:
        actor.role === Role.ADMIN
          ? query.condominiumId
          : (actor.condominiumId ?? ''),
      block: query.block,
      // Moradores enxergam apenas o próprio apartamento
      id: actor.role === Role.MORADOR ? (actor.apartmentId ?? '') : undefined,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.apartment.findMany({
        where,
        include: { _count: { select: { residents: true } } },
        orderBy: [{ block: 'asc' }, { number: 'asc' }],
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.apartment.count({ where }),
    ]);
    return paginated(data, total, query);
  }

  async findOne(actor: AuthUser, id: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
      include: { condominium: true, ...residentsSelect },
    });
    if (
      !apartment ||
      (actor.role === Role.MORADOR && actor.apartmentId !== id)
    ) {
      throw new NotFoundException('Apartamento não encontrado');
    }
    assertCondominiumAccess(actor, apartment.condominiumId);
    return apartment;
  }

  async update(actor: AuthUser, id: string, dto: UpdateApartmentDto) {
    await this.findOne(actor, id);
    return this.prisma.apartment
      .update({ where: { id }, data: dto })
      .catch(this.handleUniqueError);
  }

  async remove(actor: AuthUser, id: string) {
    await this.findOne(actor, id);
    await this.prisma.apartment.delete({ where: { id } });
  }

  private handleUniqueError = (error: unknown): never => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Já existe um apartamento com este número e bloco no condomínio',
      );
    }
    throw error;
  };
}
