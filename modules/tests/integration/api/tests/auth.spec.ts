import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';
import { Redis } from 'ioredis';
import { AuthRequest, AuthResponse, GetOtpRequest } from '@vidya/protocol';
import { OtpStorageKey, Routes } from '@vidya/domain';


test.describe('Authentication', () => {
  const routes = Routes('http://localhost:8001');
  const redis = new Redis({
    host: 'localhost', // TODO: configure by environment variable
    port: 6379, // TODO: configure by environment variable
  });

  const context = {
    email: '',
    otp: '',
  }

  test.beforeEach(async ({ request }) => {
    context.email = faker.internet.exampleEmail();
    const payload: GetOtpRequest = { email: context.email };
    await request.post(routes.otp.root(), { data: payload });
    context.otp = await redis.get(OtpStorageKey(context.email));
  });

  /* -------------------------------------------------------------------------- */
  /*                           Should Not Authenticate                          */
  /* -------------------------------------------------------------------------- */

  test('should not authenticate if otp is incorrect', async ({ request }) => {
    const otp = faker.string.numeric({ length: 6 });
    const payload: AuthRequest = { email: context.email, otp };

    // act: request token without requesting OTP
    const response = await request.post(routes.auth.login(), { data: payload });
    const data = await response.json();

    // assert: 401 is returned with error message
    expect(response.status()).toBe(401);
    expect(data).toEqual({
      message: ['otp is invalid'],
      error: 'Unauthorized',
      statusCode: 401
    });
  });

  test('should not authenticate if otp is expired', async ({ request }) => {
    // arrange: expire OTP
    await redis.expire(OtpStorageKey(context.email), 0);

    // act: request token with expired OTP
    const payload: AuthRequest = { email: context.email, otp: context.otp };
    const response = await request.post(routes.auth.login(), { data: payload });

    // assert: 401 is returned with error message
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: ['otp is invalid'],
      error: 'Unauthorized',
      statusCode: 401
    });
  });

  test('should not authenticate if otp is used', async ({ request }) => {
    const payload: AuthRequest = { email: context.email, otp: context.otp };

    // arrange: request token with OTP
    await request.post(routes.auth.login(), { data: payload });

    // act: request token with used OTP
    const response = await request.post(routes.auth.login(), { data: payload });

    // assert: 401 is returned with error message
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: ['otp is invalid'],
      error: 'Unauthorized',
      statusCode: 401
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                             Should Authenticate                            */
  /* -------------------------------------------------------------------------- */

  test('should authenticate if valid otp is provided', async ({ request }) => {
    // act: request token with OTP
    const payload: AuthRequest = { email: context.email, otp: context.otp };
    const response = await request.post(routes.auth.login(), { data: payload });
    const responseData: AuthResponse = await response.json();

    // assert: token is returned
    expect(responseData.accessToken).toBeDefined();
    expect(responseData.refreshToken).toBeDefined();
  });

  test('should authenticate if valid otp is provided after several mistakes', async ({ request }) => {
    const payload: AuthRequest = { email: context.email, otp: context.otp };

    // arrange: request token with invalid OTP
    await request.post(routes.auth.login(), { data: { ...payload, otp: '000000' } });
    await request.post(routes.auth.login(), { data: { ...payload, otp: '999999' } });

    // act: request token with OTP
    const response = await request.post(routes.auth.login(), { data: payload });
    const responseData: AuthResponse = await response.json();

    // assert: token is returned
    expect(responseData.accessToken).toBeDefined();
    expect(responseData.refreshToken).toBeDefined();
  });
});
