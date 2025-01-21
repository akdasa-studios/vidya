import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationTable1736855400685
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE organizations;`);
  }
}
