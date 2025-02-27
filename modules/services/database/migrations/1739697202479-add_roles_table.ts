import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRolesTable1739697202479 implements MigrationInterface {
  name = 'AddRolesTable1739697202479'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying NOT NULL,
        "permissions" character varying array, 
        "organizationId" uuid NOT NULL,
        "schoolId" uuid NULL,
        CONSTRAINT "pk_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_roles_organization_id"
          FOREIGN KEY ("organizationId")
          REFERENCES "organizations"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "fk_roles_school_id"
          FOREIGN KEY ("schoolId")
          REFERENCES "schools"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
