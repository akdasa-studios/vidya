import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGroupsTable1737021558648 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."groupStatus" AS ENUM('pending', 'active', 'inactive');
      CREATE TABLE "groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "courseId" uuid NOT NULL,
        "startsAt" TIMESTAMP, "status" "public"."groupStatus" NOT NULL DEFAULT 'pending',
        CONSTRAINT "UQ_664ea405ae2a10c264d582ee563" UNIQUE ("name"),
        CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id")
      );

      ALTER TABLE "groups"
        ADD CONSTRAINT "FK_89ce024cb71a24a02b09fb8f879"
        FOREIGN KEY ("courseId")
        REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`
      );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "groups";
      DROP TYPE "groupStatus";
    `);
  }
}
