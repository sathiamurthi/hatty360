import { Pool } from 'pg';
import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

let pgPool: Pool | null = null;
let sqliteDb: sqlite3.Database | null = null;
let isPostgres = false;

// Read config
const dbUrl = process.env.DATABASE_URL;

export async function initDb() {
  if (dbUrl) {
    console.log('Database: Configuring PostgreSQL connection...');
    pgPool = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
    });
    isPostgres = true;
    try {
      // Test connection
      await pgPool.query('SELECT NOW()');
      console.log('Database: Successfully connected to PostgreSQL.');

      // Check if users table exists. If not, auto-seed.
      const tableCheck = await pgPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'users'
        )
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('Database: PostgreSQL tables not found. Auto-running schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // Run all commands in a transaction
        await pgPool.query('BEGIN');
        await pgPool.query(schemaSql);
        await pgPool.query('COMMIT');
        console.log('Database: PostgreSQL successfully initialized and seeded.');
      } else {
        console.log('Database: Existing PostgreSQL schema detected. Skipping seeding.');
      }
    } catch (err) {
      console.error('Database: PostgreSQL connection failed! Check DATABASE_URL.', err);
      throw err;
    }
  } else {
    console.log('Database: No DATABASE_URL found. Falling back to local SQLite database...');
    const dbPath = path.join(__dirname, 'local_database.db');
    const isNewDb = !fs.existsSync(dbPath);
    
    sqliteDb = new sqlite3.Database(dbPath);
    isPostgres = false;
    console.log(`Database: Connected to local SQLite file at: ${dbPath}`);

    if (isNewDb) {
      console.log('Database: Fresh SQLite file detected. Running schema.sql...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // sqlite3 doesn't run multiple statements easily via query. We must split them or use .exec()
      await new Promise<void>((resolve, reject) => {
        sqliteDb!.exec(schemaSql, (err) => {
          if (err) {
            console.error('Database: Error seeding SQLite database:', err);
            reject(err);
          } else {
            console.log('Database: SQLite database successfully initialized and seeded.');
            resolve();
          }
        });
      });
    }
    
    // Ensure all tables and columns are created/altered in both PG and SQLite
    console.log('Database: Running auto-migrations...');
    if (isPostgres && pgPool) {
      try {
        await pgPool.query("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'feedback'");
        await pgPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_hatty_ids INTEGER[]");
        await pgPool.query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_hatty_ids INTEGER[]");
        await pgPool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS target_hatty_ids INTEGER[]");
        await pgPool.query("ALTER TABLE hattys ADD COLUMN IF NOT EXISTS description TEXT");
        await pgPool.query("ALTER TABLE hattys ADD COLUMN IF NOT EXISTS location TEXT");
        
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS sponsor_offers (
            id SERIAL PRIMARY KEY,
            business_name VARCHAR(255) NOT NULL,
            offer_title VARCHAR(255) NOT NULL,
            offer_description TEXT,
            coupon_code VARCHAR(100),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS talents (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            contact_info VARCHAR(255),
            portfolio_link VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS life_events (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            person_name VARCHAR(255) NOT NULL,
            date_of_event DATE NOT NULL,
            description TEXT,
            target_hatty_ids INTEGER[],
            created_by VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS group_memberships (
            id SERIAL PRIMARY KEY,
            group_id INTEGER REFERENCES community_groups(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(50) DEFAULT 'member',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(group_id, user_id)
          )
        `);
      } catch (err) {
        console.error('PostgreSQL auto-migrations warning:', err);
      }
    } else if (sqliteDb) {
      // Running on SQLite
      await new Promise<void>((resolve) => {
        sqliteDb!.serialize(() => {
          // Alter tables
          sqliteDb!.run("ALTER TABLE feedback ADD COLUMN type VARCHAR(50) DEFAULT 'feedback'", (err) => {});
          sqliteDb!.run("ALTER TABLE users ADD COLUMN managed_hatty_ids TEXT", (err) => {});
          sqliteDb!.run("ALTER TABLE announcements ADD COLUMN target_hatty_ids TEXT", (err) => {});
          sqliteDb!.run("ALTER TABLE events ADD COLUMN target_hatty_ids TEXT", (err) => {});
          sqliteDb!.run("ALTER TABLE hattys ADD COLUMN description TEXT", (err) => {});
          sqliteDb!.run("ALTER TABLE hattys ADD COLUMN location TEXT", (err) => {});
          
          // Create tables
          sqliteDb!.run(`
            CREATE TABLE IF NOT EXISTS sponsor_offers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              business_name TEXT NOT NULL,
              offer_title TEXT NOT NULL,
              offer_description TEXT,
              coupon_code TEXT,
              is_active INTEGER DEFAULT 1,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          sqliteDb!.run(`
            CREATE TABLE IF NOT EXISTS talents (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              name TEXT NOT NULL,
              category TEXT NOT NULL,
              description TEXT NOT NULL,
              contact_info TEXT,
              portfolio_link TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          sqliteDb!.run(`
            CREATE TABLE IF NOT EXISTS life_events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              type TEXT NOT NULL,
              person_name TEXT NOT NULL,
              date_of_event DATE NOT NULL,
              description TEXT,
              target_hatty_ids TEXT,
              created_by TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          sqliteDb!.run(`
            CREATE TABLE IF NOT EXISTS group_memberships (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              group_id INTEGER,
              user_id INTEGER,
              role TEXT DEFAULT 'member',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(group_id, user_id)
            )
          `, () => {
            resolve();
          });
        });
      });
    }
  }
}

// Unified Query interface
export async function query(sqlText: string, params: any[] = []): Promise<{ rows: any[] }> {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(sqlText, params);
    return { rows: res.rows };
  } else if (sqliteDb) {
    // Translate PG array filters to SQLite compatibility
    let sqliteSql = sqlText;
    sqliteSql = sqliteSql.replace(/cardinality\(([^)]+)\)\s*=\s*0/gi, "($1 IS NULL OR $1 = '' OR $1 = '[]')");
    // Replace $1 = ANY(a.target_hatty_ids) with (a.target_hatty_ids LIKE '%' || $1 || '%')
    sqliteSql = sqliteSql.replace(/(\$\d+)\s*=\s*ANY\(([^)]+)\)/gi, "( $2 LIKE '%' || $1 || '%' )");

    const matches = sqliteSql.match(/\$\d+/g);
    if (matches) {
      // Sort in descending order to avoid replacing e.g. $10 before $1
      const sortedMatches = [...new Set(matches)].sort((a, b) => {
        const numA = parseInt(a.slice(1));
        const numB = parseInt(b.slice(1));
        return numB - numA;
      });
      for (const match of sortedMatches) {
        sqliteSql = sqliteSql.replace(new RegExp('\\' + match, 'g'), '?');
      }
    }

    // Convert parameter arrays to string representations for SQLite storage
    const sqliteParams = params.map(p => Array.isArray(p) ? JSON.stringify(p) : p);
    
    // SQLite uses ON CONFLICT DO NOTHING differently or syntax differences.
    // In our schema.sql we use standard SQLite syntax.
    // Let's replace 'SERIAL PRIMARY KEY' or similar if dynamic queries are passed, but our queries will be standard SQL.
    // We should map sqlite returning rows
    return new Promise<{ rows: any[] }>((resolve, reject) => {
      // Check if it's a SELECT query
      const isSelect = sqliteSql.trim().toUpperCase().startsWith('SELECT');
      const isInsert = sqliteSql.trim().toUpperCase().startsWith('INSERT');
      const isUpdate = sqliteSql.trim().toUpperCase().startsWith('UPDATE');
      const isDelete = sqliteSql.trim().toUpperCase().startsWith('DELETE');

      if (isSelect) {
        sqliteDb!.all(sqliteSql, sqliteParams, (err, rows) => {
          if (err) {
            console.error(`SQLite Error running select [${sqliteSql}]:`, err);
            reject(err);
          } else {
            resolve({ rows: rows || [] });
          }
        });
      } else {
        // Run INSERT / UPDATE / DELETE
        // If query has RETURNING * (common in PG), we should simulate it in SQLite
        const hasReturning = sqliteSql.toUpperCase().includes('RETURNING');
        let sqlWithoutReturning = sqliteSql;
        if (hasReturning) {
          sqlWithoutReturning = sqliteSql.replace(/RETURNING\s+\*|RETURNING\s+\w+/gi, '');
        }

        sqliteDb!.run(sqlWithoutReturning, sqliteParams, function (err) {
          if (err) {
            console.error(`SQLite Error running statement [${sqliteSql}]:`, err);
            reject(err);
          } else {
            // For inserts with RETURNING *, simulate by fetching the inserted row using lastID
            if (isInsert && hasReturning) {
              const lastId = this.lastID;
              // Extract table name from INSERT INTO <table> ...
              const tableMatch = sqliteSql.match(/INSERT\s+INTO\s+(\w+)/i);
              if (tableMatch) {
                const tableName = tableMatch[1];
                sqliteDb!.all(`SELECT * FROM ${tableName} WHERE rowid = ?`, [lastId], (err2, rows) => {
                  if (err2) reject(err2);
                  else resolve({ rows: rows || [] });
                });
              } else {
                resolve({ rows: [] });
              }
            } else if ((isUpdate || isDelete) && hasReturning) {
              // RETURNING on update/delete - return empty list or mock response
              resolve({ rows: [] });
            } else {
              resolve({ rows: [] });
            }
          }
        });
      }
    });
  } else {
    throw new Error('Database: DB not initialized. Call initDb() first.');
  }
}
