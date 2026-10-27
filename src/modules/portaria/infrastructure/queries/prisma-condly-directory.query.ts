import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { CondlyDirectoryQuery } from '../../application/queries/condly-directory.query';

@Injectable()
export class PrismaCondlyDirectoryQuery implements CondlyDirectoryQuery {
  constructor(private readonly prisma: PrismaService) {}

  findByCondlyPortariaId(condlyPortariaId: string) {
    return this.prisma.condominium.findUnique({
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
  }
}
