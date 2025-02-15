import { RevokedTokenStorageKey } from '@vidya/protocol';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { JwtToken } from '@vidya/protocol';

@Injectable()
export class RevokedTokensService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: 'localhost', // TODO: configure by environment variable
      port: 6379, // TODO: configure by environment variable
    });
  }

  /**
   * Checks if the given JWT token has been revoked.
   *
   * @param token - The JWT token to check.
   * @returns A promise that resolves to a boolean indicating whether the token is revoked.
   */
  async isRevoked(token: JwtToken): Promise<boolean> {
    return (await this.client.exists(RevokedTokenStorageKey(token))) === 1;
  }

  /**
   * Revokes a given JWT token by storing it in a storage with an expiration time.
   *
   * @param token - The JWT token to be revoked.
   * @returns A promise that resolves when the token has been successfully revoked.
   */
  async revoke(token: JwtToken): Promise<void> {
    await this.client.set(
      RevokedTokenStorageKey(token),
      'revoked',
      'EX',
      token.exp - token.iat,
    );
  }
}
