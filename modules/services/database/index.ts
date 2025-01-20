import * as fs from 'fs';
import * as path from 'path';

const migrationsPath = path.join(__dirname, './migrations');
const migrationFiles = fs.readdirSync(migrationsPath).sort();

export const Migrations = migrationFiles.map(file => {
  const migration = require(path.join(migrationsPath, file));
  const migrationClass = Object.values(migration)[0];
  return migrationClass;
});
