import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Actor } from '../../../../shared/application/actor';
import { mapPaginated } from '../../../../shared/application/pagination';
import { Role } from '../../../../shared/domain/role';
import { CurrentUser } from '../../../../shared/infrastructure/http/decorators/current-user.decorator';
import { Roles } from '../../../../shared/infrastructure/http/decorators/roles.decorator';
import { FinalizePortariaEventUseCase } from '../../application/use-cases/finalize-portaria-event.use-case';
import { GetPortariaEventUseCase } from '../../application/use-cases/get-portaria-event.use-case';
import { ListPortariaEventsUseCase } from '../../application/use-cases/list-portaria-events.use-case';
import { RespondPortariaEventUseCase } from '../../application/use-cases/respond-portaria-event.use-case';
import { ListPortariaEventsDto } from '../dtos/list-portaria-events.dto';
import { RespondPortariaEventDto } from '../dtos/respond-portaria-event.dto';
import { PortariaEventPresenter } from '../presenters/portaria-event.presenter';

@ApiTags('Portaria')
@ApiBearerAuth()
@Controller('portaria-events')
export class PortariaEventsController {
  constructor(
    private readonly listEvents: ListPortariaEventsUseCase,
    private readonly getEvent: GetPortariaEventUseCase,
    private readonly respondEvent: RespondPortariaEventUseCase,
    private readonly finalizeEvent: FinalizePortariaEventUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista visitantes, encomendas e prestadores' })
  async findAll(
    @CurrentUser() actor: Actor,
    @Query() query: ListPortariaEventsDto,
  ) {
    return mapPaginated(await this.listEvents.execute(actor, query), (item) =>
      PortariaEventPresenter.toHTTP(item),
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return PortariaEventPresenter.toHTTP(
      await this.getEvent.execute(actor, id),
    );
  }

  @Patch(':id/respond')
  @Roles(Role.MORADOR)
  @ApiOperation({ summary: 'Morador autoriza ou nega a entrada' })
  async respond(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RespondPortariaEventDto,
  ) {
    return PortariaEventPresenter.toHTTP(
      await this.respondEvent.execute(actor, id, dto.status),
    );
  }

  @Patch(':id/finalize')
  @Roles(Role.ADMIN, Role.SINDICO, Role.PORTEIRO)
  @ApiOperation({ summary: 'Finaliza o evento (entrada/entrega concluída)' })
  async finalize(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return PortariaEventPresenter.toHTTP(
      await this.finalizeEvent.execute({ reference: id, actor }),
    );
  }
}
