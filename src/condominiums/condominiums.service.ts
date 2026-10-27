import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertCondominiumAccess, AuthUser } from '../auth/auth-user';
import { PaginationDto, paginated } from '../common/dto/pagination.dto';
import { Prisma } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCondominiumDto } from './dto/create-condominium.dto';
import { UpdateCondominiumDto } from './dto/update-condominium.dto';

@Injectable()
export class CondominiumsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCondominiumDto) {
    return this.prisma.condominium
      .create({ data: dto })
      .catch(this.handleUniqueError);
  }

  async findAll(actor: AuthUser, query: PaginationDto) {
    const where: Prisma.CondominiumWhereInput =
      actor.role === Role.ADMIN ? {} : { id: actor.condominiumId ?? '' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.condominium.findMany({
        where,
        include: { _count: { select: { apartments: true } } },
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.condominium.count({ where }),
    ]);
    return paginated(data, total, query);
  }

  async findOne(actor: AuthUser, id: string) {
    assertCondominiumAccess(actor, id);
    const condominium = await this.prisma.condominium.findUnique({
      where: { id },
      include: { _count: { select: { apartments: true, users: true } } },
    });
    if (!condominium) throw new NotFoundException('Condomínio não encontrado');
    return condominium;
  }

  async update(actor: AuthUser, id: string, dto: UpdateCondominiumDto) {
    await this.findOne(actor, id);
    return this.prisma.condominium
      .update({ where: { id }, data: dto })
      .catch(this.handleUniqueError);
  }

  async remove(actor: AuthUser, id: string) {
    await this.findOne(actor, id);
    await this.prisma.condominium.delete({ where: { id } });
  }

  private handleUniqueError = (error: unknown): never => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'CNPJ ou ID da portaria Condly já cadastrado',
      );
    }
    throw error;
  };
}
