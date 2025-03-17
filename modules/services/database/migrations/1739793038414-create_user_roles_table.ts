import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserRolesTable1739793038414 implements MigrationInterface {
  name = 'CreateUserRolesTable1739793038414'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "userRoles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "userId" uuid NOT NULL,
        "roleId" uuid NOT NULL,
        CONSTRAINT "pk_userRoles_id" 
          PRIMARY KEY ("id"),
        CONSTRAINT "fk_userRoles_userId" 
          FOREIGN KEY ("userId") REFERENCES "users"("id") 
          ON DELETE CASCADE 
          ON UPDATE NO ACTION,
        CONSTRAINT "fk_userRoles_roleId"
          FOREIGN KEY ("roleId") REFERENCES "roles"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION
      );
      CREATE INDEX "idx_userRoles_userId" ON "userRoles" ("userId");
      CREATE INDEX "idx_userRoles_roleId" ON "userRoles" ("roleId");
    `);
}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_userRoles_roleId"`);
    await queryRunner.query(`DROP INDEX "public"."idx_userRoles_userId"`);
    await queryRunner.query(`DROP TABLE "userRoles"`);
  }
}
