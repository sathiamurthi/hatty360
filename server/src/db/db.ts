import { Pool } from 'pg';
import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

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
  }
}

// Unified Query interface
export async function query(sqlText: string, params: any[] = []): Promise<{ rows: any[] }> {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(sqlText, params);
    return { rows: res.rows };
  } else if (sqliteDb) {
    // Translate postgres $1, $2 to sqlite ?
    // Check parameters and replace e.g. $1 with ?
    let sqliteSql = sqlText;
    const matches = sqlText.match(/\$\d+/g);
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
        sqliteDb!.all(sqliteSql, params, (err, rows) => {
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

        sqliteDb!.run(sqlWithoutReturning, params, function (err) {
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
