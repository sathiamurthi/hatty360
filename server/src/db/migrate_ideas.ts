import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
const dbUrl = process.env.DATABASE_URL;

async function run() {
  if (!dbUrl) {
    console.error('Error: DATABASE_URL is not set.');
    process.exit(1);
  }
  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
  });
  try {
    await client.connect();
    console.log('Connected to DB. Running ideas column migration...');
    
    await client.query(`
      ALTER TABLE feedback ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'feedback';
    `);
    
    console.log('Ideas migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
run();
