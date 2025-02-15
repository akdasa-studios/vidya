import { faker } from '@faker-js/faker';
import { test, expect, APIRequestContext } from '@playwright/test';
import { Redis } from 'ioredis';
import { AuthRequest, OtpType } from '@vidya/protocol';
import { OtpStorageKey, Routes, Otp } from '@vidya/protocol';

test.describe('Authentication :: Tokens :: Refresh', () => {
  const routes = Routes('http://localhost:8001');
  const redis = new Redis({
    host: 'localhost', // TODO: configure by environment variable
    port: 6379, // TODO: configure by environment variable
  });

  let email: string;
  let otp: Otp;
  let accessToken: string;
  let refreshToken: string;

  test.beforeEach(async ({ request }) => {
    email = faker.internet.exampleEmail();
    otp = { code: '123456', method: OtpType.Email };
    await redis.set(OtpStorageKey(email), JSON.stringify(otp));

    const payload: AuthRequest = { login: email, otp: otp.code };
    const response = await request.post(routes.auth.login('otp'), {
      data: payload,
    });
    const data = await response.json();
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Helpers                                  */
  /* -------------------------------------------------------------------------- */

  async function callRefreshToken(
    request: APIRequestContext,
    refreshToken: string,
  ) {
    const response = await request.post(routes.auth.tokens.refresh(), {
      data: { refreshToken },
    });
    return {
      status: response.status(),
      data: await response.json(),
    };
  }

  async function callLogOut(
    request: APIRequestContext,
    accessToken: string,
    refreshToken: string,
  ) {
    const response = await request.post(routes.auth.logout(), {
      data: { refreshToken },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      status: response.status(),
      data: await response.json(),
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    Tests                                   */
  /* -------------------------------------------------------------------------- */

  /**
   * Should return new access and refresh tokens.
   */
  test('should refresh tokens', async ({ request }) => {
    // act: refresh token with valid refresh token
    const { status, data } = await callRefreshToken(request, refreshToken);

    // assert: new tokens (access and refresh) are returned
    expect(status).toBe(200);
    expect(data.accessToken).toBeDefined();
    expect(data.refreshToken).toBeDefined();
  });

  /**
   * Should not refresh token with invalid refresh token (expired
   * or already used or revoked) and return 401 Unauthorized.
   */
  test('should not refresh token with used token', async ({ request }) => {
    // arrange: refresh token
    await callRefreshToken(request, refreshToken);

    // act: refresh token with used refresh token
    const { status, data } = await callRefreshToken(request, refreshToken);

    // assert: 401 is returned with error message
    expect(status).toBe(401);
    expect(data).toEqual({
      message: ['Refresh token is revoked'],
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  /**
   * Should not refresh the token after the user logs out
   * because the refresh token has been revoked.
   */
  test('should not refresh token once user logged out', async ({ request }) => {
    // arrange: logout user
    await callLogOut(request, accessToken, refreshToken);

    // act: refresh token
    const { status, data } = await callRefreshToken(request, refreshToken);

    // assert: 401 is returned with error message
    expect(status).toBe(401);
    expect(data).toEqual({
      message: ['Refresh token is revoked'],
      error: 'Unauthorized',
      statusCode: 401,
    });
  });
});
