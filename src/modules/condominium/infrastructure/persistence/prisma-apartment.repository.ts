import { Injectable } from '@nestjs/common';
import {
  Page,
  PaginationParams,
  skipOf,
} from '../../../../shared/domain/pagination';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { Apartment } from '../../domain/entities/apartment';
import {
  ApartmentFilter,
  ApartmentRepository,
} from '../../domain/repositories/apartment-repository';
import { PrismaApartmentMapper } from './prisma-apartment.mapper';

@Injectable()
export class PrismaApartmentRepository implements ApartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const raw = await this.prisma.apartment.findUnique({ where: { id } });
    return raw && PrismaApartmentMapper.toDomain(raw);
  }

  async findByUnit(condominiumId: string, block: string, number: string) {
    const raw = await this.prisma.apartment.findUnique({
      where: {
        condominiumId_block_number: { condominiumId, block, number },
      },
    });
    return raw && PrismaApartmentMapper.toDomain(raw);
  }

  async findMany(
    filter: ApartmentFilter,
    pagination: PaginationParams,
  ): Promise<Page<Apartment>> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.apartment.findMany({
        where: filter,
        orderBy: [{ block: 'asc' }, { number: 'asc' }],
        skip: skipOf(pagination),
        take: pagination.limit,
      }),
      this.prisma.apartment.count({ where: filter }),
    ]);
    return {
      items: rows.map((row) => PrismaApartmentMapper.toDomain(row)),
      total,
    };
  }

  async create(apartment: Apartment) {
    await this.prisma.apartment.create({
      data: PrismaApartmentMapper.toPrisma(apartment),
    });
  }

  async save(apartment: Apartment) {
    const { id, ...data } = PrismaApartmentMapper.toPrisma(apartment);
    await this.prisma.apartment.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.apartment.delete({ where: { id } });
  }
}
