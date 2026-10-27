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
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { ListPortariaEventsDto } from './dto/list-portaria-events.dto';
import { RespondPortariaEventDto } from './dto/respond-portaria-event.dto';
import { PortariaService } from './portaria.service';

@ApiTags('Portaria')
@ApiBearerAuth()
@Controller('portaria-events')
export class PortariaController {
  constructor(private readonly portariaService: PortariaService) {}

  @Get()
  @ApiOperation({ summary: 'Lista visitantes, encomendas e prestadores' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ListPortariaEventsDto,
  ) {
    return this.portariaService.findAll(user, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portariaService.findOne(user, id);
  }

  @Patch(':id/respond')
  @Roles(Role.MORADOR)
  @ApiOperation({ summary: 'Morador autoriza ou nega a entrada' })
  respond(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RespondPortariaEventDto,
  ) {
    return this.portariaService.respond(user, id, dto);
  }

  @Patch(':id/finalize')
  @Roles(Role.ADMIN, Role.SINDICO, Role.PORTEIRO)
  @ApiOperation({ summary: 'Finaliza o evento (entrada/entrega concluída)' })
  finalize(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portariaService.finalizeByStaff(user, id);
  }
}
