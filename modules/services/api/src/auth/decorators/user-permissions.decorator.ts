import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPermissions, VidyaRequest } from '@vidya/api/auth/utils';

// TODO !high rename to UserPermissions / Permissions or something
export const UserWithPermissions = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const userPermissions = ctx
      .switchToHttp()
      .getRequest<VidyaRequest>().userPermissions;
    return new UserPermissions(userPermissions);
  },
);
