import { Module } from '@nestjs/common';
import { CondominiumModule } from '../condominium/condominium.module';
import { ResidentNotifier } from './application/ports/resident-notifier';
import { CondlyDirectoryQuery } from './application/queries/condly-directory.query';
import { FinalizePortariaEventUseCase } from './application/use-cases/finalize-portaria-event.use-case';
import { GetCondlyDirectoryUseCase } from './application/use-cases/get-condly-directory.use-case';
import { GetPortariaEventByReferenceUseCase } from './application/use-cases/get-portaria-event-by-reference.use-case';
import { GetPortariaEventUseCase } from './application/use-cases/get-portaria-event.use-case';
import { ListPortariaEventsUseCase } from './application/use-cases/list-portaria-events.use-case';
import { RegisterPortariaEventUseCase } from './application/use-cases/register-portaria-event.use-case';
import { RespondPortariaEventUseCase } from './application/use-cases/respond-portaria-event.use-case';
import { PortariaEventRepository } from './domain/repositories/portaria-event-repository';
import { FirebaseResidentNotifier } from './infrastructure/notifications/firebase-resident-notifier';
import { PrismaPortariaEventRepository } from './infrastructure/persistence/prisma-portaria-event.repository';
import { PrismaCondlyDirectoryQuery } from './infrastructure/queries/prisma-condly-directory.query';
import { CondlyIntegrationController } from './presentation/controllers/condly-integration.controller';
import { PortariaEventsController } from './presentation/controllers/portaria-events.controller';

@Module({
  imports: [CondominiumModule],
  controllers: [PortariaEventsController, CondlyIntegrationController],
  providers: [
    {
      provide: PortariaEventRepository,
      useClass: PrismaPortariaEventRepository,
    },
    { provide: ResidentNotifier, useClass: FirebaseResidentNotifier },
    { provide: CondlyDirectoryQuery, useClass: PrismaCondlyDirectoryQuery },
    RegisterPortariaEventUseCase,
    GetPortariaEventByReferenceUseCase,
    GetPortariaEventUseCase,
    ListPortariaEventsUseCase,
    RespondPortariaEventUseCase,
    FinalizePortariaEventUseCase,
    GetCondlyDirectoryUseCase,
  ],
})
export class PortariaModule {}
