import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoursesTable1737020704224 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE course_learning_type AS ENUM ('individual', 'group');
      CREATE TABLE courses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL UNIQUE,
        description VARCHAR,
        learningType course_learning_type NOT NULL DEFAULT 'individual'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE courses;
        DROP TYPE course_learning_type;
    `);
  }
}
