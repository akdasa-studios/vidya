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
        CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
