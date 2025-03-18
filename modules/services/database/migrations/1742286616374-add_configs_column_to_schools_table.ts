import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConfigsColumnToSchoolsTable1742286616374 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "schools"
        ADD COLUMN "config" json NOT NULL DEFAULT '{}';
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "schools"
        DROP COLUMN "config";
      `);
    }
}
