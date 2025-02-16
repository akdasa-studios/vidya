import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '@vidya/api/configs';
import { RefreshToken } from '@vidya/protocol';
import { v4 as uuidv4 } from 'uuid';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(userId: string): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(
      {
        jti: uuidv4(),
        sub: userId,
      },
      {
        expiresIn: this.jwtConfig.accessTokenExpiresIn,
        secret: this.jwtConfig.secret,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        jti: uuidv4(),
        sub: userId,
      },
      {
        expiresIn: this.jwtConfig.refreshTokenExpiresIn,
        secret: this.jwtConfig.secret,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string): Promise<RefreshToken | undefined> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshToken>(token, {
        secret: this.jwtConfig.secret,
      });
      return payload;
    } catch {
      return undefined;
    }
  }
}
