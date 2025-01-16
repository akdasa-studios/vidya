import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLessonsTable1737023266585 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE lessons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        courseId UUID NOT NULL,
        lessonNumber INT NOT NULL UNIQUE,
        title VARCHAR NOT NULL UNIQUE,
        content JSON NOT NULL,
        CONSTRAINT fk_course FOREIGN KEY(courseId) REFERENCES courses(id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE lessons;`);
  }
}
