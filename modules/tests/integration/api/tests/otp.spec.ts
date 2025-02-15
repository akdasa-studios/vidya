import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';
import { Redis } from 'ioredis';
import { GetOtpRequest } from '@vidya/protocol';
import { OtpStorageKey, Routes, OtpType } from '@vidya/protocol';


test.describe('Authentication :: OTP', () => {
  const routes = Routes('http://localhost:8001');
  const redis = new Redis({
    host: 'localhost', // TODO: configure by environment variable
    port: 6379, // TODO: configure by environment variable
  });

  test('should generate OTP if email is valid', async ({ request }) => {
    // arrange: request OTP
    const email = faker.internet.exampleEmail();
    const payload: GetOtpRequest = { type: OtpType.Email, destination: email };

    // act: request OTP for the email
    const response = await request.post(routes.otp.root(), { data: payload });


    // assert: OTP is generated
    const otp = await redis.get(OtpStorageKey(email));

    expect(otp).toBeDefined();
    expect(await response.json()).toEqual({
      success: true,
      message: 'OTP has been sent'
    });
  });

  test('should not generate OTP if previous one is still valid', async ({ request }) => {
    const email = faker.internet.exampleEmail();
    const payload: GetOtpRequest = { type: OtpType.Email, destination: email };

    // arrange: request OTP
    await request.post(routes.otp.root(), { data: payload });

    // act: request token with not expired OTP
    const response = await request.post(routes.otp.root(), { data: payload });

    // assert: 429 is returned with error message
    expect(response.status()).toBe(429);
    expect(await response.json()).toEqual({
      success: false,
      message: 'An OTP has already been generated and is still valid.'
    });
  });
});
