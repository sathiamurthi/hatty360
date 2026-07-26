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
    console.log('Connected to DB. Running features migrations...');
    
    // 1. Sponsor offers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sponsor_offers (
        id SERIAL PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        offer_title VARCHAR(255) NOT NULL,
        offer_description TEXT,
        coupon_code VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Seed sponsor offers
    await client.query(`
      INSERT INTO sponsor_offers (business_name, offer_title, offer_description, coupon_code, is_active) VALUES
      ('Nilgiris Tea Depot', '15% Off Premium Green Tea', 'Get 15% discount on all orthodox Nilgiri green teas.', 'NILGIRI15', TRUE),
      ('Coimbatore Silk House', 'Save ₹500 on Wedding Sarees', 'Special discount coupon valid on purchases above ₹5000.', 'SILK500', TRUE)
      ON CONFLICT DO NOTHING;
    `);

    // 2. Talents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS talents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        contact_info VARCHAR(255),
        portfolio_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Seed talents
    await client.query(`
      INSERT INTO talents (name, category, description, contact_info) VALUES
      ('Vikram Gowder', 'Sports', 'State-level long jump champion and athletic coach.', '9876543210'),
      ('Shailaja Madhavan', 'Singer', 'Classical Carnatic singer performing for community festivals.', 'shailaja@music.com')
      ON CONFLICT DO NOTHING;
    `);

    // 3. Life events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS life_events (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        person_name VARCHAR(255) NOT NULL,
        date_of_event DATE NOT NULL,
        description TEXT,
        target_hatty_ids INTEGER[],
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Seed life events
    await client.query(`
      INSERT INTO life_events (type, person_name, date_of_event, description, target_hatty_ids, created_by) VALUES
      ('birthday', 'Gowda Siddanna', CURRENT_DATE, 'Celebrating 90 years of community service and wisdom!', NULL, 'Super Admin'),
      ('obituary', 'Kempamma Gowder', CURRENT_DATE - INTERVAL '1 day', 'With deep sadness, we announce the passing of Kempamma. Funeral at Melur village compound.', ARRAY[7], 'Super Admin')
      ON CONFLICT DO NOTHING;
    `);

    // 4. Alter user/announcements/events tables to support scoping
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_hatty_ids INTEGER[];
      ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_hatty_ids INTEGER[];
      ALTER TABLE events ADD COLUMN IF NOT EXISTS target_hatty_ids INTEGER[];
    `);

    console.log('Features migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
run();
