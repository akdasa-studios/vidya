import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRolesTable1739697202479 implements MigrationInterface {
  name = 'CreateRolesTable1739697202479'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying NOT NULL,
        "permissions" character varying array, 
        "schoolId" uuid NULL,
        CONSTRAINT "pk_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_roles_school_id"
          FOREIGN KEY ("schoolId")
          REFERENCES "schools"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
