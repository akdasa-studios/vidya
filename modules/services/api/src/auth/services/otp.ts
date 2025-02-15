import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OtpConfig, RedisConfig } from '@vidya/api/configs';
import { Otp, OtpStorageKey, OtpType } from '@vidya/protocol';
import { Redis } from 'ioredis';

/**
 * Service for generating and validating one-time passwords (OTPs) using Redis.
 */
@Injectable()
export class OtpService {
  private readonly client: Redis;

  /**
   * Constructs an instance of the OTP service.
   *
   * @param redisConfig - The configuration for connecting to the Redis server.
   */
  constructor(
    @Inject(RedisConfig.KEY)
    private readonly redisConfig: ConfigType<typeof RedisConfig>,
    @Inject(OtpConfig.KEY)
    private readonly otpConfig: ConfigType<typeof OtpConfig>,
  ) {
    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
    });
  }

  /**
   * Generates a one-time password for the given login and type.
   *
   * @param login - The login identifier for which the OTP is being generated.
   * @param type - The type or method of OTP generation (e.g., SMS, email).
   * @returns A promise that resolves to the generated OTP code as a string.
   */
  async generate(login: string, type: OtpType): Promise<Otp> {
    const otp: Otp = {
      code: this.generateCode(),
      type: type,
    };
    await this.client.set(OtpStorageKey(login), JSON.stringify(otp), 'EX', 300);
    return otp;
  }

  /**
   * Checks if the one-time password for the given login has expired.
   *
   * @param login - The login identifier for which to check the OTP expiration.
   * @returns A promise that resolves to a boolean indicating whether the OTP has expired.
   */
  async isExpired(login: string): Promise<boolean> {
    const key = OtpStorageKey(login);
    return !(await this.client.exists(key));
  }

  /**
   * Validates the provided OTP code for the given login.
   *
   * @param login - The login identifier for which the OTP code is being validated.
   * @param code - The OTP code to validate.
   * @returns A promise that resolves to the Otp object if the code is
   *          correct, or undefined if the code is incorrect or not found.
   *
   * @remarks
   * The OTP code is expired immediately upon successful validation to
   * prevent replay attacks and multiple logins.
   */
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

  /**
   * Generates a random OTP  code based on the configured
   * alphabet and length.
   *
   * @returns A randomly generated OTP code.
   */
  private generateCode(): string {
    const characters = this.otpConfig.alphabet;
    const length = this.otpConfig.length;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
