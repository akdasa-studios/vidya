import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@vidya/api/app.module';
import {
  AuthUsersService,
  OtpService,
  RevokedTokensService,
} from '@vidya/api/auth/services';
import { inMemoryDataSource } from '@vidya/api/utils';
import { useContainer } from 'class-validator';
import { DataSource } from 'typeorm';

export const createTestingApp = async (): Promise<INestApplication> => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DataSource)
    .useValue(await inMemoryDataSource())
    // Mock the services with Redis client
    // to avoid connecting to the actual Redis server
    // and keeping connection open during the tests
    .overrideProvider(OtpService)
    .useValue({ validate: jest.fn() })
    .overrideProvider(RevokedTokensService)
    .useValue({ isRevoked: jest.fn() })
    .overrideProvider(AuthUsersService)
    .useValue({})
    .compile();

  const app = module.createNestApplication();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.init();
  return app;
};
