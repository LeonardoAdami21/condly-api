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
import { CreateApartmentUseCase } from '../../application/use-cases/create-apartment.use-case';
import { DeleteApartmentUseCase } from '../../application/use-cases/delete-apartment.use-case';
import { GetApartmentUseCase } from '../../application/use-cases/get-apartment.use-case';
import { ListApartmentsUseCase } from '../../application/use-cases/list-apartments.use-case';
import { UpdateApartmentUseCase } from '../../application/use-cases/update-apartment.use-case';
import { CreateApartmentDto } from '../dtos/create-apartment.dto';
import { ListApartmentsDto } from '../dtos/list-apartments.dto';
import { UpdateApartmentDto } from '../dtos/update-apartment.dto';
import { ApartmentPresenter } from '../presenters/apartment.presenter';

@ApiTags('Apartamentos')
@ApiBearerAuth()
@Controller('apartments')
export class ApartmentsController {
  constructor(
    private readonly createApartment: CreateApartmentUseCase,
    private readonly listApartments: ListApartmentsUseCase,
    private readonly getApartment: GetApartmentUseCase,
    private readonly updateApartment: UpdateApartmentUseCase,
    private readonly deleteApartment: DeleteApartmentUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SINDICO)
  @ApiOperation({ summary: 'Cadastra apartamento' })
  async create(@CurrentUser() actor: Actor, @Body() dto: CreateApartmentDto) {
    return ApartmentPresenter.toHTTP(
      await this.createApartment.execute(actor, dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lista apartamentos' })
  async findAll(
    @CurrentUser() actor: Actor,
    @Query() query: ListApartmentsDto,
  ) {
    return mapPaginated(
      await this.listApartments.execute(actor, query),
      (item) => ApartmentPresenter.toHTTP(item),
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return ApartmentPresenter.toHTTP(
      await this.getApartment.execute(actor, id),
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SINDICO)
  async update(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApartmentDto,
  ) {
    return ApartmentPresenter.toHTTP(
      await this.updateApartment.execute(actor, id, dto),
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SINDICO)
  @HttpCode(204)
  remove(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.deleteApartment.execute(actor, id);
  }
}
