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
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/fcm-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Registra o token de push (Firebase) do app' })
  updateFcmToken(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateFcmTokenDto,
  ) {
    return this.usersService.updateFcmToken(user.id, dto.fcmToken);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SINDICO)
  @ApiOperation({ summary: 'Cadastra usuário (síndico, porteiro ou morador)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(user, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SINDICO, Role.PORTEIRO)
  @ApiOperation({ summary: 'Lista usuários' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListUsersDto) {
    return this.usersService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SINDICO, Role.PORTEIRO)
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SINDICO)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SINDICO)
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.remove(user, id);
  }
}
