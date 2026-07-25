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
    console.log('Connected to DB. Running table creations...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_groups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        privacy TEXT NOT NULL DEFAULT 'public',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS threads (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES community_groups(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS thread_replies (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS helpline_contacts (
        id SERIAL PRIMARY KEY,
        contact_person TEXT NOT NULL,
        phone TEXT NOT NULL,
        purpose TEXT NOT NULL,
        hatty_id INTEGER REFERENCES hattys(id) ON DELETE CASCADE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
run();
