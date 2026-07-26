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
    console.log('Connected to DB. Running privacy migrations...');
    
    // 1. Add email column
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
    `);
    
    // 2. Add show_contact_publicly column
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS show_contact_publicly BOOLEAN DEFAULT FALSE;
    `);
    
    // 3. Create contact_requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_requests (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        requested_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, requested_id)
      );
    `);

    // 4. Seed SuperAdmin if not exists
    await client.query(`
      INSERT INTO users (phone, name, email, role, status, selected_language) 
      VALUES ('0000000000', 'Super Admin', 'superadmin@demandgeniusai.com', 'SuperAdmin', 'approved', 'en')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Privacy migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
run();
