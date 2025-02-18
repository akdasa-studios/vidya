import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthorizedUser implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // get required permissions
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    // get user's permissions (see AuthenticatedUser)
    const permissions = request['accessToken']?.permissions ?? [];

    // check if user has required permissions
    if (
      !requiredPermissions.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      throw new UnauthorizedException(
        'User does not have required permissions',
      );
    }

    return true;
  }
}
