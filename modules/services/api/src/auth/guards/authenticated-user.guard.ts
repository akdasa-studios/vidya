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
export class AuthenticatedUserGuard implements CanActivate {
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

      // Create final access token object with user permissions
      // (if not already present in the token)
      const userPermissions = accessToken.permissions
        ? accessToken.permissions
        : await this.usersService.getUserPermissions(accessToken.sub);
      request.accessToken = {
        ...accessToken,
        permissions: userPermissions,
      };
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
