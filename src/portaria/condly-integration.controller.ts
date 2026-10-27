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
import { Public } from '../auth/decorators/public.decorator';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { CreatePortariaEventDto } from './dto/create-portaria-event.dto';
import { PortariaService } from './portaria.service';

/** Endpoints consumidos pelo sistema de portaria Condly (autenticação por x-api-key). */
@ApiTags('Integração Condly')
@ApiSecurity('api-key')
@Public()
@UseGuards(ApiKeyGuard)
@Controller('integrations/condly')
export class CondlyIntegrationController {
  constructor(private readonly portariaService: PortariaService) {}

  @Get('condominiums/:condlyPortariaId/apartments')
  @ApiOperation({ summary: 'Sincroniza apartamentos e moradores' })
  listApartments(@Param('condlyPortariaId') condlyPortariaId: string) {
    return this.portariaService.listApartmentsForCondly(condlyPortariaId);
  }

  @Post('events')
  @ApiOperation({
    summary: 'Registra visitante/encomenda/prestador e notifica os moradores',
  })
  createEvent(@Body() dto: CreatePortariaEventDto) {
    return this.portariaService.createFromCondly(dto);
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Consulta status do evento (id ou externalId)' })
  findEvent(@Param('id') id: string) {
    return this.portariaService.findForCondly(id);
  }

  @Patch('events/:id/finalize')
  @ApiOperation({ summary: 'Finaliza o evento (id ou externalId)' })
  finalizeEvent(@Param('id') id: string) {
    return this.portariaService.finalizeFromCondly(id);
  }
}
