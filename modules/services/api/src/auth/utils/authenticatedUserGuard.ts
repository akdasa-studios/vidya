import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RevokedTokensService } from '../services/revokedTokens';
import { JwtToken } from '@vidya/protocol';

@Injectable()
export class AuthenticatedUser implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private revoketTokensService: RevokedTokensService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtToken>(token, {
        secret: 'SECRET', // TODO: use env variable
      });

      const isTokenRevoked = await this.revoketTokensService.isRevoked(payload);
      if (isTokenRevoked) {
        throw new UnauthorizedException();
      }

      request['accessToken'] = payload;
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
