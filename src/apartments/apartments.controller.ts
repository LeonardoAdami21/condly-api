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
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { ListApartmentsDto } from './dto/list-apartments.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

@ApiTags('Apartamentos')
@ApiBearerAuth()
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SINDICO)
  @ApiOperation({ summary: 'Cadastra apartamento' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApartmentDto) {
    return this.apartmentsService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista apartamentos' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListApartmentsDto) {
    return this.apartmentsService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha apartamento com moradores' })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.apartmentsService.findOne(user, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SINDICO)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApartmentDto,
  ) {
    return this.apartmentsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SINDICO)
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.apartmentsService.remove(user, id);
  }
}
