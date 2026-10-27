import { Module } from '@nestjs/common';
import { CreateApartmentUseCase } from './application/use-cases/create-apartment.use-case';
import { CreateCondominiumUseCase } from './application/use-cases/create-condominium.use-case';
import { DeleteApartmentUseCase } from './application/use-cases/delete-apartment.use-case';
import { DeleteCondominiumUseCase } from './application/use-cases/delete-condominium.use-case';
import { GetApartmentUseCase } from './application/use-cases/get-apartment.use-case';
import { GetCondominiumUseCase } from './application/use-cases/get-condominium.use-case';
import { ListApartmentsUseCase } from './application/use-cases/list-apartments.use-case';
import { ListCondominiumsUseCase } from './application/use-cases/list-condominiums.use-case';
import { UpdateApartmentUseCase } from './application/use-cases/update-apartment.use-case';
import { UpdateCondominiumUseCase } from './application/use-cases/update-condominium.use-case';
import { ApartmentRepository } from './domain/repositories/apartment-repository';
import { CondominiumRepository } from './domain/repositories/condominium-repository';
import { PrismaApartmentRepository } from './infrastructure/persistence/prisma-apartment.repository';
import { PrismaCondominiumRepository } from './infrastructure/persistence/prisma-condominium.repository';
import { ApartmentsController } from './presentation/controllers/apartments.controller';
import { CondominiumsController } from './presentation/controllers/condominiums.controller';

@Module({
  controllers: [CondominiumsController, ApartmentsController],
  providers: [
    { provide: CondominiumRepository, useClass: PrismaCondominiumRepository },
    { provide: ApartmentRepository, useClass: PrismaApartmentRepository },
    CreateCondominiumUseCase,
    ListCondominiumsUseCase,
    GetCondominiumUseCase,
    UpdateCondominiumUseCase,
    DeleteCondominiumUseCase,
    CreateApartmentUseCase,
    ListApartmentsUseCase,
    GetApartmentUseCase,
    UpdateApartmentUseCase,
    DeleteApartmentUseCase,
  ],
  exports: [CondominiumRepository, ApartmentRepository],
})
export class CondominiumModule {}
