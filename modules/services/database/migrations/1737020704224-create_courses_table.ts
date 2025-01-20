import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoursesTable1737020704224 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."courseLearningType" AS ENUM('individual', 'group');
      CREATE TABLE "courses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "learningType" "public"."courseLearningType" NOT NULL DEFAULT 'individual',
        "schoolId" uuid NOT NULL, CONSTRAINT "UQ_6ba1a54849ae17832337a39d5e5" UNIQUE ("name"),
        CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id")
      );

      ALTER TABLE "courses"
        ADD CONSTRAINT "FK_9689700fc21294dc6abbb0e3180"
        FOREIGN KEY ("schoolId")
        REFERENCES "schools"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "courses";
        DROP TYPE "courseLearningType";
    `);
  }
}
