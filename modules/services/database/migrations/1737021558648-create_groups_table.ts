import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGroupsTable1737021558648 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE group_status AS ENUM ('pending', 'active', 'inactive');
      CREATE TABLE groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL UNIQUE,
        description VARCHAR,
        courseId UUID NOT NULL,
        startsAt TIMESTAMP,
        status group_status NOT NULL DEFAULT 'pending',
        CONSTRAINT fk_course FOREIGN KEY(courseId) REFERENCES courses(id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE groups;
      DROP TYPE group_status;
    `);
  }
}
