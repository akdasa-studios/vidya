import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@vidya/api/app.module';
import { inMemoryDataSource } from '@vidya/api/shared/datasources';
import { RedisService } from '@vidya/api/shared/services';
import { useContainer } from 'class-validator';
import { DataSource } from 'typeorm';

export const createTestingApp = async (): Promise<INestApplication> => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DataSource)
    .useValue(await inMemoryDataSource())
    .overrideProvider(RedisService)
    .useValue({
      get: jest.fn(),
      set: jest.fn(),
      exists: jest.fn(),
      del: jest.fn(),
    })
    .compile();

  const app = module.createNestApplication();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.init();
  return app;
};
