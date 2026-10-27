import { Injectable } from '@nestjs/common';
import {
  Page,
  PaginationParams,
  skipOf,
} from '../../../../shared/domain/pagination';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { User } from '../../domain/entities/user';
import {
  UserFilter,
  UserRepository,
} from '../../domain/repositories/user-repository';
import { PrismaUserMapper } from './prisma-user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw && PrismaUserMapper.toDomain(raw);
  }

  async findByEmail(email: string) {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw && PrismaUserMapper.toDomain(raw);
  }

  async findMany(
    filter: UserFilter,
    pagination: PaginationParams,
  ): Promise<Page<User>> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: filter,
        orderBy: { name: 'asc' },
        skip: skipOf(pagination),
        take: pagination.limit,
      }),
      this.prisma.user.count({ where: filter }),
    ]);
    return { items: rows.map((row) => PrismaUserMapper.toDomain(row)), total };
  }

  async create(user: User) {
    await this.prisma.user.create({ data: PrismaUserMapper.toPrisma(user) });
  }

  async save(user: User) {
    const { id, ...data } = PrismaUserMapper.toPrisma(user);
    await this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }
}
