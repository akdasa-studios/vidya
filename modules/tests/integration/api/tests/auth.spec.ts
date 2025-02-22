import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';
import {
  OtpLogInRequest,
  OtpLogInResponse,
  GetOtpRequest,
  OtpType,
} from '@vidya/protocol';
import { OtpStorageKey, Routes, Otp } from '@vidya/protocol';
import { redis } from '../helpers/redis';

const routes = Routes('http://localhost:8001');

test.describe('Authentication', () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */

  const unauthorizedResponse = {
    message: ['otp is invalid'],
    error: 'Unauthorized',
    statusCode: 401,
  };

  let email: string;
  let otp: string;

  /* -------------------------------------------------------------------------- */
  /*                                    Tests                                   */
  /* -------------------------------------------------------------------------- */

  test.beforeEach(async ({ request }) => {
    email = faker.internet.exampleEmail();
    const payload: GetOtpRequest = {
      type: OtpType.Email,
      destination: email,
    };
    await request.post(routes.otp.root(), { data: payload });
    const storedOtp: Otp = JSON.parse(await redis.get(OtpStorageKey(email)));
    otp = storedOtp.code;
  });

  /* -------------------------------------------------------------------------- */
  /*                           Should Not Authenticate                          */
  /* -------------------------------------------------------------------------- */

  test('should not authenticate if otp is incorrect', async ({ request }) => {
    const data: OtpLogInRequest = {
      login: email,
      otp: faker.string.numeric({ length: 6 }),
    };

    // act: request token without requesting OTP
    const response = await request.post(routes.auth.login('otp'), { data });
    const responseData = await response.json();

    // assert: 401 is returned with error message
    expect(response.status()).toBe(401);
    expect(responseData).toEqual(unauthorizedResponse);
  });

  test('should not authenticate if otp is expired', async ({ request }) => {
    // arrange: expire OTP
    await redis.expire(OtpStorageKey(email), 0);

    // act: request token with expired OTP
    const data: OtpLogInRequest = { login: email, otp };
    const response = await request.post(routes.auth.login('otp'), { data });
    const responseData = await response.json();

    // assert: 401 is returned with error message
    expect(response.status()).toBe(401);
    expect(responseData).toEqual(unauthorizedResponse);
  });

  test('should not authenticate if otp is used', async ({ request }) => {
    // arrange: request token with OTP
    const data: OtpLogInRequest = { login: email, otp };
    await request.post(routes.auth.login('otp'), { data });

    // act: request token with used OTP
    const response = await request.post(routes.auth.login('otp'), { data });

    // assert: 401 is returned with error message
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual(unauthorizedResponse);
  });

  /* -------------------------------------------------------------------------- */
  /*                             Should Authenticate                            */
  /* -------------------------------------------------------------------------- */

  test('should authenticate if valid otp is provided', async ({ request }) => {
    // act: request token with OTP
    const data: OtpLogInRequest = { login: email, otp };
    const response = await request.post(routes.auth.login('otp'), { data });
    const responseData: OtpLogInResponse = await response.json();

    // assert: token is returned
    expect(responseData.accessToken).toBeDefined();
    expect(responseData.refreshToken).toBeDefined();
  });

  test('should authenticate if valid otp is provided after several mistakes', async ({
    request,
  }) => {
    const payload: OtpLogInRequest = { login: email, otp };

    // arrange: request token with invalid OTP
    await request.post(routes.auth.login('otp'), {
      data: { ...payload, otp: '000000' },
    });
    await request.post(routes.auth.login('otp'), {
      data: { ...payload, otp: '999999' },
    });

    // act: request token with OTP
    const response = await request.post(routes.auth.login('otp'), {
      data: payload,
    });
    const responseData: OtpLogInResponse = await response.json();

    // assert: token is returned
    expect(responseData.accessToken).toBeDefined();
    expect(responseData.refreshToken).toBeDefined();
  });
});
