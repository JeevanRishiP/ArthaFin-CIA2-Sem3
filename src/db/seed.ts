import fs from 'fs';
import path from 'path';
import pool from './pool';

async function runSeed() {
  try {
    console.log('🔄 Executing src/db/seed.sql...');
    const sqlPath = fs.existsSync(path.join(__dirname, 'seed.sql'))
      ? path.join(__dirname, 'seed.sql')
      : path.join(process.cwd(), 'src', 'db', 'seed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('✅ PostgreSQL sample data successfully seeded!');
  } catch (error) {
    console.error('❌ Error executing seed.sql:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
