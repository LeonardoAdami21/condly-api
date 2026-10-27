import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { assertCondominiumAccess, AuthUser } from '../auth/auth-user';
import { paginated } from '../common/dto/pagination.dto';
import { Role } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const omitPassword = { password: true } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actor: AuthUser, dto: CreateUserDto) {
    const role = dto.role ?? Role.MORADOR;
    this.assertCanAssignRole(actor, role);
    const links = await this.resolveLinks(actor, role, dto);
    await this.assertEmailAvailable(dto.email);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role,
        password: await bcrypt.hash(dto.password, 10),
        ...links,
      },
      omit: omitPassword,
    });
  }

  async findAll(actor: AuthUser, query: ListUsersDto) {
    const where = {
      condominiumId:
        actor.role === Role.ADMIN
          ? query.condominiumId
          : (actor.condominiumId ?? ''),
      apartmentId: query.apartmentId,
      role: query.role,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        omit: omitPassword,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return paginated(data, total, query);
  }

  async findOne(id: string, actor?: AuthUser) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: omitPassword,
      include: { condominium: true, apartment: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (actor && actor.id !== id) {
      assertCondominiumAccess(actor, user.condominiumId ?? '');
    }
    return user;
  }

  async update(actor: AuthUser, id: string, dto: UpdateUserDto) {
    const current = await this.findOne(id, actor);
    const role = dto.role ?? current.role;
    if (dto.role || current.role === Role.ADMIN) {
      this.assertCanAssignRole(actor, role);
    }
    if (dto.email && dto.email !== current.email) {
      await this.assertEmailAvailable(dto.email);
    }

    const links =
      dto.role || dto.condominiumId || dto.apartmentId
        ? await this.resolveLinks(actor, role, {
            condominiumId:
              dto.condominiumId ?? current.condominiumId ?? undefined,
            apartmentId: dto.apartmentId ?? current.apartmentId ?? undefined,
          })
        : {};

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        password: dto.password
          ? await bcrypt.hash(dto.password, 10)
          : undefined,
        ...links,
      },
      omit: omitPassword,
    });
  }

  async remove(actor: AuthUser, id: string) {
    const user = await this.findOne(id, actor);
    if (user.id === actor.id) {
      throw new BadRequestException('Não é possível remover o próprio usuário');
    }
    this.assertCanAssignRole(actor, user.role);
    await this.prisma.user.delete({ where: { id } });
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });
  }

  /** Síndicos só gerenciam porteiros e moradores. */
  private assertCanAssignRole(actor: AuthUser, role: Role) {
    if (
      actor.role !== Role.ADMIN &&
      (role === Role.ADMIN || role === Role.SINDICO)
    ) {
      throw new ForbiddenException(`Sem permissão para gerenciar ${role}`);
    }
  }

  /** Valida condomínio/apartamento e garante que o apartamento pertence ao condomínio. */
  private async resolveLinks(
    actor: AuthUser,
    role: Role,
    dto: Pick<CreateUserDto, 'condominiumId' | 'apartmentId'>,
  ) {
    if (role === Role.ADMIN) return { condominiumId: null, apartmentId: null };

    let condominiumId =
      actor.role === Role.ADMIN ? dto.condominiumId : actor.condominiumId;
    let apartmentId: string | null = null;

    if (dto.apartmentId) {
      const apartment = await this.prisma.apartment.findUnique({
        where: { id: dto.apartmentId },
      });
      if (!apartment) throw new NotFoundException('Apartamento não encontrado');
      if (condominiumId && condominiumId !== apartment.condominiumId) {
        throw new BadRequestException(
          'Apartamento não pertence ao condomínio informado',
        );
      }
      condominiumId = apartment.condominiumId;
      apartmentId = apartment.id;
    }

    if (!condominiumId) {
      throw new BadRequestException('condominiumId é obrigatório');
    }
    if (role === Role.MORADOR && !apartmentId) {
      throw new BadRequestException('apartmentId é obrigatório para moradores');
    }
    assertCondominiumAccess(actor, condominiumId);

    const exists = await this.prisma.condominium.count({
      where: { id: condominiumId },
    });
    if (!exists) throw new NotFoundException('Condomínio não encontrado');

    return { condominiumId, apartmentId };
  }

  private async assertEmailAvailable(email: string) {
    const exists = await this.prisma.user.count({ where: { email } });
    if (exists) throw new ConflictException('Email já cadastrado');
  }
}
