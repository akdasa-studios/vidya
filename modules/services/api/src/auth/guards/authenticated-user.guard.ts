import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AuthUsersService,
  RevokedTokensService,
} from '@vidya/api/auth/services';
import { VidyaRequest } from '@vidya/api/auth/utils';
import { JwtConfig } from '@vidya/api/configs';
import { AccessToken } from '@vidya/protocol';

@Injectable()
export class AuthenticatedUser implements CanActivate {
  constructor(
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>,
    private readonly jwtService: JwtService,
    private readonly revokedTokensService: RevokedTokensService,
    private readonly usersService: AuthUsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<VidyaRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // Verify the token and extract the payload
      const accessToken = await this.jwtService.verifyAsync<AccessToken>(
        token,
        {
          secret: this.jwtConfig.secret,
        },
      );

      // Check if the token has been revoked
      const isTokenRevoked =
        await this.revokedTokensService.isRevoked(accessToken);
      if (isTokenRevoked) {
        throw new UnauthorizedException();
      }

      // Attach the user id and permissions to the request object
      request.userId = accessToken.sub;
      request.accessToken = accessToken;
      request.userPermissions = accessToken.permissions
        ? accessToken.permissions
        : await this.usersService.getUserPermissions(accessToken.sub);
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: VidyaRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
