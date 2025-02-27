import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPermissions } from '@vidya/api/auth/utils';
import { AccessToken } from '@vidya/protocol';

export const UserWithPermissions = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const accessToken: AccessToken = ctx
      .switchToHttp()
      .getRequest().accessToken;
    return new UserPermissions(accessToken.permissions);
  },
);
