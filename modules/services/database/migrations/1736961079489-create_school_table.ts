import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchoolTable1736961079489
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE schools (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR NOT NULL,
            "organizationId" UUID NOT NULL,
            CONSTRAINT fk_organization
              FOREIGN KEY("organizationId")
              REFERENCES organizations(id)
          );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE schools;`);
  }
}
