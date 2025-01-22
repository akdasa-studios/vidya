import * as domain from '@vidya/domain';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class OtpService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: 'localhost', // TODO: configure by environment variable
      port: 6379, // TODO: configure by environment variable
    });
  }

  async generate(login: string): Promise<string> {
    const key = domain.OtpStorageKey(login);
    const code = Math.floor(100000 + Math.random() * 999999).toString();
    await this.client.set(key, code, 'EX', 300);
    return code;
  }

  async isExpired(login: string): Promise<boolean> {
    const key = domain.OtpStorageKey(login);
    return !(await this.client.exists(key));
  }

  async validate(login: string, code: string): Promise<boolean> {
    const key = domain.OtpStorageKey(login);
    const storedCode = await this.client.get(key);

    // if code is correct, expire it immediately
    // to prevent replay attacks and multiple logins
    if (code === storedCode) {
      await this.client.expire(key, 0);
    }

    return code === storedCode;
  }
}
