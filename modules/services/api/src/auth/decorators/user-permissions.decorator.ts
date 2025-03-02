import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserPermissions } from '@vidya/api/auth/utils';
import { AccessToken } from '@vidya/protocol';

export const UserWithPermissions = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const accessToken: AccessToken = ctx
      .switchToHttp()
      .getRequest().accessToken;
    if (!accessToken) {
      throw new UnauthorizedException('Access token not found');
    }
    return new UserPermissions(accessToken.permissions);
  },
);
