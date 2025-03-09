import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '@vidya/api/configs';
import { RefreshToken, UserPermission } from '@vidya/protocol';
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

  /**
   * Generates access and refresh tokens for the user.
   * @param userId User ID
   * @param permissions Permissions to save in the token (optional)
   * @returns Access and refresh tokens
   */
  async generateTokens(
    userId: string,
    permissions?: UserPermission[],
  ): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(
      {
        jti: uuidv4(),
        sub: userId,
        permissions,
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

  /**
   * Verifies token and returns its payload.
   * @param token Token to verify
   * @returns Token payload if the token is valid, otherwise undefined
   */
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
