import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import RedisConfig from '@vidya/api/configs/redis.config';
import { RevokedTokenStorageKey } from '@vidya/protocol';
import { JwtToken } from '@vidya/protocol';
import { Redis } from 'ioredis';

@Injectable()
export class RevokedTokensService {
  private readonly client: Redis;

  /**
   * Constructs an instance of the service with the provided Redis configuration.
   *
   * @param redisConfig The configuration object for Redis
   */
  constructor(
    @Inject(RedisConfig.KEY)
    private readonly redisConfig: ConfigType<typeof RedisConfig>,
  ) {
    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
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
