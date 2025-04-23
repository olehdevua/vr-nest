import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1745418258983 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userTable = new Table({
      name: 'users',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          // generates v1
          // default: 'uuid_generate_v1()', // Explicitly set the default function here
          // generates v4
          // generationStrategy: 'uuid',
          // isGenerated: true,
        },
        { name: 'email', type: 'varchar', isUnique: true },
        { name: 'password_hash', type: 'bytea' },
        { name: 'password_salt', type: 'bytea' },
        { name: 'name', type: 'varchar', isNullable: true },
      ],
    });
    await queryRunner.createTable(userTable, true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true, true, true);
  }
}

// CREATE TABLE "users" (
//    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
//    "email" varchar NOT NULL,
//    "password" varchar NOT NULL,
//    "name" varchar NOT NULL,
//    CONSTRAINT "UQ_a3ffb1c0c8416b9fc6f907b7433" UNIQUE ("id"),
//    CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")
// )
