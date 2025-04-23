import { DataSource } from 'typeorm';

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = process.env;

export default new DataSource({
  // entities: [],
  migrations: ['./dist/src/migrations/*.js'],
  // migrationsTableName: 'custom_migration_table',

  type: 'postgres',
  host: DATABASE_HOST,
  port: Number.parseInt(DATABASE_PORT ?? '5432'),
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  synchronize: false, // Auto-creates database schema, use with caution in production
});
