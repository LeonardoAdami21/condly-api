import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Actor } from '../../../../shared/application/actor';
import { CurrentUser } from '../../../../shared/infrastructure/http/decorators/current-user.decorator';
import { Public } from '../../../../shared/infrastructure/http/decorators/public.decorator';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { LoginDto } from '../dtos/login.dto';
import { UserPresenter } from '../presenters/user.presenter';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticateUser: AuthenticateUserUseCase,
    private readonly getUser: GetUserUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autentica e retorna o token JWT' })
  async login(@Body() dto: LoginDto) {
    const { accessToken, user } = await this.authenticateUser.execute(dto);
    return { accessToken, user: UserPresenter.toHTTP(user) };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  async me(@CurrentUser() actor: Actor) {
    return UserPresenter.toHTTP(await this.getUser.execute(actor, actor.id));
  }
}
