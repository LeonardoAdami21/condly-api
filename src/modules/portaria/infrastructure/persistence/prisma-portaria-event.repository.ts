import { Injectable } from '@nestjs/common';
import {
  Page,
  PaginationParams,
  skipOf,
} from '../../../../shared/domain/pagination';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { PortariaEvent } from '../../domain/entities/portaria-event';
import {
  PortariaEventFilter,
  PortariaEventRepository,
} from '../../domain/repositories/portaria-event-repository';
import { PrismaPortariaEventMapper } from './prisma-portaria-event.mapper';

@Injectable()
export class PrismaPortariaEventRepository implements PortariaEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const raw = await this.prisma.portariaEvent.findUnique({ where: { id } });
    return raw && PrismaPortariaEventMapper.toDomain(raw);
  }

  async findByExternalId(externalId: string) {
    const raw = await this.prisma.portariaEvent.findUnique({
      where: { externalId },
    });
    return raw && PrismaPortariaEventMapper.toDomain(raw);
  }

  async findByReference(reference: string) {
    const raw = await this.prisma.portariaEvent.findFirst({
      where: { OR: [{ id: reference }, { externalId: reference }] },
    });
    return raw && PrismaPortariaEventMapper.toDomain(raw);
  }

  async findMany(
    filter: PortariaEventFilter,
    pagination: PaginationParams,
  ): Promise<Page<PortariaEvent>> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.portariaEvent.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip: skipOf(pagination),
        take: pagination.limit,
      }),
      this.prisma.portariaEvent.count({ where: filter }),
    ]);
    return {
      items: rows.map((row) => PrismaPortariaEventMapper.toDomain(row)),
      total,
    };
  }

  async create(event: PortariaEvent) {
    await this.prisma.portariaEvent.create({
      data: PrismaPortariaEventMapper.toPrisma(event),
    });
  }

  async save(event: PortariaEvent) {
    const { id, ...data } = PrismaPortariaEventMapper.toPrisma(event);
    await this.prisma.portariaEvent.update({ where: { id }, data });
  }
}
