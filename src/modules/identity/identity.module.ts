import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CondominiumModule } from '../condominium/condominium.module';
import { PasswordHasher } from './application/ports/password-hasher';
import { TokenSigner } from './application/ports/token-signer';
import { UserAssignmentResolver } from './application/services/user-assignment.resolver';
import { AuthenticateUserUseCase } from './application/use-cases/authenticate-user.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { RegisterPushTokenUseCase } from './application/use-cases/register-push-token.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UserRepository } from './domain/repositories/user-repository';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';
import { JwtTokenSigner } from './infrastructure/auth/jwt-token-signer';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { RolesGuard } from './infrastructure/auth/roles.guard';
import { BcryptPasswordHasher } from './infrastructure/crypto/bcrypt-password-hasher';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { AuthController } from './presentation/controllers/auth.controller';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  imports: [
    CondominiumModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get(
            'JWT_EXPIRES_IN',
            '1d',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: TokenSigner, useClass: JwtTokenSigner },
    UserAssignmentResolver,
    AuthenticateUserUseCase,
    CreateUserUseCase,
    ListUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    RegisterPushTokenUseCase,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class IdentityModule {}
