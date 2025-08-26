import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './server/config/database.js';

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
