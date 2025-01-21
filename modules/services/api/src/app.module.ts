import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entities, Organization } from '@vidya/entities';
import { OrganizationsService } from './organizations.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: Entities,
      autoLoadEntities: true,
      logging: true, // TODO: configure by environment variable
    }),
    TypeOrmModule.forFeature([Organization]),
    AuthModule,
  ],
  controllers: [],
  providers: [OrganizationsService],
})
export class AppModule {}
