import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';
import { GetOtpRequest } from '@vidya/protocol';
import { OtpStorageKey, Routes, OtpType } from '@vidya/protocol';
import { redis } from '../helpers/redis';

test.describe('Authentication :: OTP', () => {
  const routes = Routes('http://localhost:8001');

  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */

  const getOtpUrl = routes.otp.root();

  let email: string;
  let payload: GetOtpRequest;

  test.beforeEach(() => {
    email = faker.internet.exampleEmail();
    payload = {
      type: OtpType.Email,
      destination: email,
    };
  });

  /* -------------------------------------------------------------------------- */
  /*                                    Tests                                   */
  /* -------------------------------------------------------------------------- */

  test('should generate OTP', async ({ request }) => {
    // act: request OTP for the email
    const response = await request.post(getOtpUrl, { data: payload });

    // assert: OTP is generated
    const otp = await redis.get(OtpStorageKey(email));
    expect(otp).toBeDefined();
    expect(await response.json()).toEqual({
      success: true,
      message: 'OTP has been sent',
    });
  });

  test('should not generate OTP if previous one valid', async ({ request }) => {
    // arrange: request OTP
    await request.post(getOtpUrl, { data: payload });

    // act: request token with not expired OTP
    const response = await request.post(getOtpUrl, { data: payload });

    // assert: 429 is returned with error message
    expect(response.status()).toBe(429);
    expect(await response.json()).toEqual({
      success: false,
      message: 'An OTP has already been generated and is still valid.',
    });
  });
});
