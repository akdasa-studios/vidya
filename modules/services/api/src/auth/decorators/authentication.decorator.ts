import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAuthentication, VidyaRequest } from '@vidya/api/auth/utils';

export const Authentication = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<VidyaRequest>();
    return new UserAuthentication(request.accessToken);
  },
);
