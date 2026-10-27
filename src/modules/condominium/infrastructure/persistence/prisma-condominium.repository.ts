import { Injectable } from '@nestjs/common';
import {
  Page,
  PaginationParams,
  skipOf,
} from '../../../../shared/domain/pagination';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { Condominium } from '../../domain/entities/condominium';
import {
  CondominiumFilter,
  CondominiumRepository,
} from '../../domain/repositories/condominium-repository';
import { PrismaCondominiumMapper } from './prisma-condominium.mapper';

@Injectable()
export class PrismaCondominiumRepository implements CondominiumRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const raw = await this.prisma.condominium.findUnique({ where: { id } });
    return raw && PrismaCondominiumMapper.toDomain(raw);
  }

  async findByCnpj(cnpj: string) {
    const raw = await this.prisma.condominium.findUnique({ where: { cnpj } });
    return raw && PrismaCondominiumMapper.toDomain(raw);
  }

  async findByCondlyPortariaId(condlyPortariaId: string) {
    const raw = await this.prisma.condominium.findUnique({
      where: { condlyPortariaId },
    });
    return raw && PrismaCondominiumMapper.toDomain(raw);
  }

  async findMany(
    filter: CondominiumFilter,
    pagination: PaginationParams,
  ): Promise<Page<Condominium>> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.condominium.findMany({
        where: filter,
        orderBy: { name: 'asc' },
        skip: skipOf(pagination),
        take: pagination.limit,
      }),
      this.prisma.condominium.count({ where: filter }),
    ]);
    return {
      items: rows.map((row) => PrismaCondominiumMapper.toDomain(row)),
      total,
    };
  }

  async create(condominium: Condominium) {
    await this.prisma.condominium.create({
      data: PrismaCondominiumMapper.toPrisma(condominium),
    });
  }

  async save(condominium: Condominium) {
    const { id, ...data } = PrismaCondominiumMapper.toPrisma(condominium);
    await this.prisma.condominium.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.condominium.delete({ where: { id } });
  }
}
