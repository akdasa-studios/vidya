import { Otp, OtpStorageKey } from '@vidya/protocol';
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

  async generate(login: string, method: string): Promise<string> {
    const key = OtpStorageKey(login);
    const code = Math.floor(100000 + Math.random() * 999999).toString();
    const payload = JSON.stringify({ code, method } as Otp);
    await this.client.set(key, payload, 'EX', 300);
    return code;
  }

  async isExpired(login: string): Promise<boolean> {
    const key = OtpStorageKey(login);
    return !(await this.client.exists(key));
  }

  async validate(login: string, code: string): Promise<Otp | undefined> {
    const key = OtpStorageKey(login);
    const stored: Otp = JSON.parse(await this.client.get(key));
    if (!stored) return undefined;

    // if code is correct, expire it immediately
    // to prevent replay attacks and multiple logins
    if (code === stored.code) {
      await this.client.expire(key, 0);
      return stored;
    }

    // if code is incorrect, return undefined
    return undefined;
  }
}
