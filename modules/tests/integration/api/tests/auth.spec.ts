import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';
import { Redis } from 'ioredis';
import { AuthRequest, AuthResponse } from '@vidya/protocol';
import { OtpStorageKey, Routes } from '@vidya/domain';


test.describe('Authentication', () => {
  const routes = Routes('http://localhost:8001');
  const redis = new Redis({
    host: 'localhost', // TODO: configure by environment variable
    port: 6379, // TODO: configure by environment variable
  });

  /* -------------------------------------------------------------------------- */
  /*                             Invalid Credentials                            */
  /* -------------------------------------------------------------------------- */

  test.describe('should not authenticate', () => {

    test('if email is invalid', async ({ request }) => {
      // act: request token with invalid email
      const payload: AuthRequest = { login: 'invalid_email' };
      const response = await request.post(routes.auth.login(), { data: payload });

      // assert: 400 is returned with error message
      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({
        message: ['login must be an email'],
        error: 'Bad Request',
        statusCode: 400
      });
    });

    test('if code is incorrect', async ({ request }) => {
      const login = faker.internet.exampleEmail();
      const code = faker.string.numeric({length: 6});
      const payload: AuthRequest = { login, code };

      // act: request token without requesting OTP
      const response = await request.post(routes.auth.login(), { data: payload });
      const data = await response.json();

      // assert: 401 is returned with error message
      expect(response.status()).toBe(401);
      expect(data).toEqual({
        message: ['code is invalid'],
        error: 'Unauthorized',
        statusCode: 401
      });
    });

    test('if code is expired', async ({ request }) => {
      // arrange: request OTP
      const login = faker.internet.exampleEmail();
      const payload1: AuthRequest = { login };
      await request.post(routes.auth.login(), { data: payload1 });

      // arrage: request token with expired OTP
      const otp = await redis.get(OtpStorageKey(login));

      // arrange: expire OTP
      await redis.expire(OtpStorageKey(login), 0);

      // act: request token with expired OTP
      const payload2: AuthRequest = { ...payload1, code: otp };
      const response2 = await request.post(routes.auth.login(), { data: payload2 });

      // assert: 401 is returned with error message
      expect(response2.status()).toBe(401);
      expect(await response2.json()).toEqual({
        message: ['code is invalid'],
        error: 'Unauthorized',
        statusCode: 401
      });
    });

    test('if code is used', async ({ request }) => {
      // arrange: request OTP
      const login = faker.internet.exampleEmail();
      const payload1: AuthRequest = { login };
      await request.post(routes.auth.login(), { data: payload1 });

      // arrange: request token with OTP
      const otp = await redis.get(OtpStorageKey(login));
      const payload2: AuthRequest = { ...payload1, code: otp };
      await request.post(routes.auth.login(), { data: payload2 });

      // act: request token with used OTP
      const response3 = await request.post(routes.auth.login(), { data: payload2 });

      // assert: 401 is returned with error message
      expect(response3.status()).toBe(401);
      expect(await response3.json()).toEqual({
        message: ['code is invalid'],
        error: 'Unauthorized',
        statusCode: 401
      });
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                              Valid Credentials                             */
  /* -------------------------------------------------------------------------- */

  test.describe('should authenticate', () => {

    test('if valid code is provided', async ({ request }) => {
      // arrange: request OTP
      const login = faker.internet.exampleEmail();
      const payload1: AuthRequest = { login };
      await request.post(routes.auth.login(), { data: payload1 });

      // act: request token with OTP
      const otp = await redis.get(OtpStorageKey(login));
      const payload2: AuthRequest = { ...payload1, code: otp };
      const response2 = await request.post(routes.auth.login(), { data: payload2 });
      const response2Data: AuthResponse = await response2.json();

      // assert: token is returned
      expect(response2Data.token).toBeDefined();
    });

    test('if valid code is provided after several mistakes', async ({ request }) => {
      // arrange: request OTP
      const login = faker.internet.exampleEmail();
      const payload1: AuthRequest = { login };
      await request.post(routes.auth.login(), { data: payload1 });

      // arrange: request token with invalid OTP
      await request.post(routes.auth.login(), { data: { ...payload1, code: '000000' } });
      await request.post(routes.auth.login(), { data: { ...payload1, code: '999999' } });

      // act: request token with OTP
      const otp = await redis.get(OtpStorageKey(login));
      const payload2: AuthRequest = { ...payload1, code: otp };
      const response2 = await request.post(routes.auth.login(), { data: payload2 });
      const response2Data: AuthResponse = await response2.json();

      // assert: token is returned
      expect(response2Data.token).toBeDefined();
    });
  });


  /* -------------------------------------------------------------------------- */
  /*                                    Flow                                    */
  /* -------------------------------------------------------------------------- */

  test.describe('should generate OTP', () => {
    test('if email is valid and no code provided', async ({ request }) => {
      // arrange: request OTP
      const login = faker.internet.exampleEmail();
      const payload: AuthRequest = { login };
      await request.post(routes.auth.login(), { data: payload });

      // act: get OTP from Redis
      const otp = await redis.get(OtpStorageKey(login));

      // assert: OTP is generated
      expect(otp).toBeDefined();
    });
  });

  test.describe('should not generate OTP', () => {
    test('if previous one is still valid', async ({ request }) => {
      const login = faker.internet.exampleEmail();
      const payload: AuthRequest = { login };

      // arrange: request OTP
      await request.post(routes.auth.login(), { data: payload });

      // act: request token with expired OTP
      const response = await request.post(routes.auth.login(), { data: payload });

      // assert: 429 is returned with error message
      expect(response.status()).toBe(429);
      expect(await response.json()).toEqual({
        message: [
          'An OTP code has already been generated and is still valid.'
        ],
        error: 'Too Many Requests',
        statusCode: 429
      });
    });
  });
});
