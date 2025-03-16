import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserRolesTable1739793038414 implements MigrationInterface {
  name = 'CreateUserRolesTable1739793038414'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "userRoles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "userId" uuid NOT NULL,
        "roleId" uuid NOT NULL,
        CONSTRAINT "PK_f51275374b5fb007ccf0fff9806" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fdf65c16d62910b4785a18cdfce" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_5760f2a1066eb90b4c223c16a10" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      );
      CREATE INDEX "IDX_fdf65c16d62910b4785a18cdfc" ON "userRoles" ("userId");
      CREATE INDEX "IDX_5760f2a1066eb90b4c223c16a1" ON "userRoles" ("roleId");
    `);
}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_5760f2a1066eb90b4c223c16a1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fdf65c16d62910b4785a18cdfc"`);
    await queryRunner.query(`DROP TABLE "userRoles"`);
  }
}
