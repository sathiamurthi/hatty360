import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Client } from 'pg';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const dbUrl = process.env.DATABASE_URL;

async function migrate() {
  if (!dbUrl) {
    console.error('Error: DATABASE_URL is not set in the environment variables or .env file.');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
  });

  try {
    await client.connect();
    console.log('Successfully connected to Neon PostgreSQL.');

    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema and seeding tables...');
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');

    console.log('Database migration and seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
