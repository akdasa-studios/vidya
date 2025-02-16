import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessToken } from '@vidya/protocol';

export const UserId = createParamDecorator((data, ctx: ExecutionContext) => {
  const accessToken: AccessToken = ctx.switchToHttp().getRequest().accessToken;
  return accessToken.sub;
});

export const UserAccessToken = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const accessToken: AccessToken = ctx
      .switchToHttp()
      .getRequest().accessToken;
    return accessToken;
  },
);
