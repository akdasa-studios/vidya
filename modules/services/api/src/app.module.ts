import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DbConfig,
  JwtConfig,
  OtpConfig,
  RedisConfig,
} from '@vidya/api/configs';
import { Entities, Organization } from '@vidya/entities';

import { AuthModule } from './auth/auth.module';
import { OrgModule } from './org/org.module';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DbConfig, OtpConfig, RedisConfig, JwtConfig],
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
    TypeOrmModule.forFeature([Organization]),
    AuthModule,
    OrgModule,
  ],
  controllers: [],
  providers: [OrganizationsService],
})
export class AppModule {}
