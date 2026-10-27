import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Actor } from '../../../../shared/application/actor';
import { Role } from '../../../../shared/domain/role';
import { ROLES_KEY } from '../../../../shared/infrastructure/http/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const actor: Actor | undefined = context.switchToHttp().getRequest().user;
    return !!actor && roles.includes(actor.role);
  }
}
