import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entities, Organization } from '@vidya/entities';
import { OrganizationsService } from './organizations.service';

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
    }),
    TypeOrmModule.forFeature([Organization]),
  ],
  controllers: [AppController],
  providers: [OrganizationsService],
})
export class AppModule {}
