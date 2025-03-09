import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPermissions, VidyaRequest } from '@vidya/api/auth/utils';

export const UserWithPermissions = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const userPermissions = ctx
      .switchToHttp()
      .getRequest<VidyaRequest>().userPermissions;
    return new UserPermissions(userPermissions);
  },
);
