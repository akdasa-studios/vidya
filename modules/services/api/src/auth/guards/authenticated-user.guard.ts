import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '@vidya/api/configs';
import { JwtToken } from '@vidya/protocol';
import { Request } from 'express';

import { RevokedTokensService } from '../services/revokedTokens.service';

@Injectable()
export class AuthenticatedUser implements CanActivate {
  constructor(
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>,
    private readonly jwtService: JwtService,
    private readonly revoketTokensService: RevokedTokensService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtToken>(token, {
        secret: this.jwtConfig.secret,
      });

      const isTokenRevoked = await this.revoketTokensService.isRevoked(payload);
      if (isTokenRevoked) {
        throw new UnauthorizedException();
      }

      request['accessToken'] = payload;
      request['userId'] = payload.sub;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
