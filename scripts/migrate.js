import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from '../server/config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running database migrations...');
    
    await migrate(db, { 
      migrationsFolder: path.join(__dirname, '../migrations')
    });
    
    console.log('✅ Migrations completed successfully');
    console.log('🎉 Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
