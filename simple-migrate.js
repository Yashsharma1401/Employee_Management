import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from 'drizzle-orm/neon-http/migrator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

// Create Neon SQL client
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle instance with Neon HTTP adapter (without schema)
const db = drizzle({ client: sql });

async function runMigration() {
  try {
    console.log('🔄 Running database migrations...');
    
    await migrate(db, { 
      migrationsFolder: './migrations'
    });
    
    console.log('✅ Migrations completed successfully');
    console.log('🎉 Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigration();
