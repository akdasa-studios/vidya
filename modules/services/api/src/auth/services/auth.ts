import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from '@vidya/protocol';
import { v4 as uuidv4 } from 'uuid';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateTokens(userId: string): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(
      {
        jti: uuidv4(),
        sub: userId,
      },
      { expiresIn: '15min' },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        jti: uuidv4(),
        sub: userId,
      },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string): Promise<RefreshToken | undefined> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshToken>(token);
      return payload;
    } catch {
      return undefined;
    }
  }
}
