import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AuthConfig,
  DbConfig,
  JwtConfig,
  MailerConfig,
  OtpConfig,
  RedisConfig,
} from '@vidya/api/configs';
import { Entities } from '@vidya/entities';

import { AuthModule } from './auth/auth.module';
import { EduModule } from './edu/edu.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        DbConfig,
        OtpConfig,
        RedisConfig,
        JwtConfig,
        AuthConfig,
        MailerConfig,
      ],
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (dbConfig: ConfigType<typeof DbConfig>) => ({
        type: dbConfig.type,
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        entities: Entities,
        logging: dbConfig.logging,
        schema: dbConfig.schema,
        autoLoadEntities: true,
        useUTC: true,
      }),
      inject: [DbConfig.KEY],
    }),
    TypeOrmModule.forFeature([]),
    AuthModule,
    EduModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
