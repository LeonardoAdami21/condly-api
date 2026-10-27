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
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { RegisterPushTokenUseCase } from '../../application/use-cases/register-push-token.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ListUsersDto } from '../dtos/list-users.dto';
import { RegisterPushTokenDto } from '../dtos/register-push-token.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserPresenter } from '../presenters/user.presenter';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly registerPushToken: RegisterPushTokenUseCase,
  ) {}

  @Patch('me/fcm-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Registra o token de push (Firebase) do app' })
  updateFcmToken(
    @CurrentUser() actor: Actor,
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.registerPushToken.execute(actor, dto.fcmToken);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SINDICO)
  @ApiOperation({ summary: 'Cadastra usuário (síndico, porteiro ou morador)' })
  async create(@CurrentUser() actor: Actor, @Body() dto: CreateUserDto) {
    return UserPresenter.toHTTP(await this.createUser.execute(actor, dto));
  }

  @Get()
  @Roles(Role.ADMIN, Role.SINDICO, Role.PORTEIRO)
  @ApiOperation({ summary: 'Lista usuários' })
  async findAll(@CurrentUser() actor: Actor, @Query() query: ListUsersDto) {
    return mapPaginated(await this.listUsers.execute(actor, query), (item) =>
      UserPresenter.toHTTP(item),
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SINDICO, Role.PORTEIRO)
  async findOne(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return UserPresenter.toHTTP(await this.getUser.execute(actor, id));
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SINDICO)
  async update(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return UserPresenter.toHTTP(await this.updateUser.execute(actor, id, dto));
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SINDICO)
  @HttpCode(204)
  remove(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUser.execute(actor, id);
  }
}
