import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Actor } from '../../../../shared/application/actor';
import { mapPaginated } from '../../../../shared/application/pagination';
import { Role } from '../../../../shared/domain/role';
import { CurrentUser } from '../../../../shared/infrastructure/http/decorators/current-user.decorator';
import { Roles } from '../../../../shared/infrastructure/http/decorators/roles.decorator';
import { PaginationDto } from '../../../../shared/infrastructure/http/pagination.dto';
import { CreateCondominiumUseCase } from '../../application/use-cases/create-condominium.use-case';
import { DeleteCondominiumUseCase } from '../../application/use-cases/delete-condominium.use-case';
import { GetCondominiumUseCase } from '../../application/use-cases/get-condominium.use-case';
import { ListCondominiumsUseCase } from '../../application/use-cases/list-condominiums.use-case';
import { UpdateCondominiumUseCase } from '../../application/use-cases/update-condominium.use-case';
import { CreateCondominiumDto } from '../dtos/create-condominium.dto';
import { UpdateCondominiumDto } from '../dtos/update-condominium.dto';
import { CondominiumPresenter } from '../presenters/condominium.presenter';

@ApiTags('Condomínios')
@ApiBearerAuth()
@Controller('condominiums')
export class CondominiumsController {
  constructor(
    private readonly createCondominium: CreateCondominiumUseCase,
    private readonly listCondominiums: ListCondominiumsUseCase,
    private readonly getCondominium: GetCondominiumUseCase,
    private readonly updateCondominium: UpdateCondominiumUseCase,
    private readonly deleteCondominium: DeleteCondominiumUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cadastra condomínio' })
  async create(@Body() dto: CreateCondominiumDto) {
    return CondominiumPresenter.toHTTP(
      await this.createCondominium.execute(dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lista condomínios acessíveis ao usuário' })
  async findAll(@CurrentUser() actor: Actor, @Query() query: PaginationDto) {
    return mapPaginated(
      await this.listCondominiums.execute(actor, query),
      (item) => CondominiumPresenter.toHTTP(item),
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return CondominiumPresenter.toHTTP(
      await this.getCondominium.execute(actor, id),
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SINDICO)
  async update(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCondominiumDto,
  ) {
    return CondominiumPresenter.toHTTP(
      await this.updateCondominium.execute(actor, id, dto),
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  remove(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.deleteCondominium.execute(actor, id);
  }
}
