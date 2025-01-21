import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchoolTable1736961079489
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "schools" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "organizationId" uuid NOT NULL,
        CONSTRAINT "PK_95b932e47ac129dd8e23a0db548" PRIMARY KEY ("id")
      );

      ALTER TABLE "schools"
        ADD CONSTRAINT "FK_42ef534f0b1efdbc6aece928cdd"
        FOREIGN KEY ("organizationId")
        REFERENCES "organizations"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE schools;`);
  }
}
