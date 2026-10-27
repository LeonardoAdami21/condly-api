import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared/infrastructure/http/decorators/public.decorator';
import { FinalizePortariaEventUseCase } from '../../application/use-cases/finalize-portaria-event.use-case';
import { GetCondlyDirectoryUseCase } from '../../application/use-cases/get-condly-directory.use-case';
import { GetPortariaEventByReferenceUseCase } from '../../application/use-cases/get-portaria-event-by-reference.use-case';
import { RegisterPortariaEventUseCase } from '../../application/use-cases/register-portaria-event.use-case';
import { ApiKeyGuard } from '../../infrastructure/auth/api-key.guard';
import { CreatePortariaEventDto } from '../dtos/create-portaria-event.dto';
import { PortariaEventPresenter } from '../presenters/portaria-event.presenter';

/** Endpoints consumidos pelo sistema de portaria Condly (autenticação por x-api-key). */
@ApiTags('Integração Condly')
@ApiSecurity('api-key')
@Public()
@UseGuards(ApiKeyGuard)
@Controller('integrations/condly')
export class CondlyIntegrationController {
  constructor(
    private readonly getDirectory: GetCondlyDirectoryUseCase,
    private readonly registerEvent: RegisterPortariaEventUseCase,
    private readonly getEventByReference: GetPortariaEventByReferenceUseCase,
    private readonly finalizeEvent: FinalizePortariaEventUseCase,
  ) {}

  @Get('condominiums/:condlyPortariaId/apartments')
  @ApiOperation({ summary: 'Sincroniza apartamentos e moradores' })
  listApartments(@Param('condlyPortariaId') condlyPortariaId: string) {
    return this.getDirectory.execute(condlyPortariaId);
  }

  @Post('events')
  @ApiOperation({
    summary: 'Registra visitante/encomenda/prestador e notifica os moradores',
  })
  async createEvent(@Body() dto: CreatePortariaEventDto) {
    return PortariaEventPresenter.toHTTP(await this.registerEvent.execute(dto));
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Consulta status do evento (id ou externalId)' })
  async findEvent(@Param('id') id: string) {
    return PortariaEventPresenter.toHTTP(
      await this.getEventByReference.execute(id),
    );
  }

  @Patch('events/:id/finalize')
  @ApiOperation({ summary: 'Finaliza o evento (id ou externalId)' })
  async finalize(@Param('id') id: string) {
    return PortariaEventPresenter.toHTTP(
      await this.finalizeEvent.execute({ reference: id }),
    );
  }
}
