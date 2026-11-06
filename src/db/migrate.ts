import fs from 'fs';
import path from 'path';
import pool from './pool';

async function runMigrations() {
  try {
    console.log('🔄 Executing src/db/init.sql...');
    const initSqlPath = fs.existsSync(path.join(__dirname, 'init.sql'))
      ? path.join(__dirname, 'init.sql')
      : path.join(process.cwd(), 'src', 'db', 'init.sql');

    if (fs.existsSync(initSqlPath)) {
      const initSql = fs.readFileSync(initSqlPath, 'utf8');
      await pool.query(initSql);
      console.log('✅ Base PostgreSQL schema initialized.');
    }

    // Execute migration files in order
    const migrationsDirCandidates = [
      path.join(__dirname, 'migrations'),
      path.join(process.cwd(), 'src', 'db', 'migrations'),
      path.join(process.cwd(), 'dist', 'db', 'migrations'),
    ];

    let migrationsDir = '';
    for (const cand of migrationsDirCandidates) {
      if (fs.existsSync(cand)) {
        migrationsDir = cand;
        break;
      }
    }

    if (migrationsDir) {
      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        console.log(`🔄 Applying migration: ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log(`✅ Applied migration: ${file}`);
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
