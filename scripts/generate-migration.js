import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateMigration() {
  try {
    console.log('🔄 Generating Drizzle migration...');
    
    const { stdout, stderr } = await execAsync('npx drizzle-kit generate');
    
    if (stderr) {
      console.error('❌ Migration generation error:', stderr);
      return;
    }
    
    console.log('✅ Migration generated successfully');
    console.log(stdout);
    
    console.log('\n📝 Next steps:');
    console.log('1. Review the generated migration in the ./migrations folder');
    console.log('2. Run: npm run migrate to apply the migration');
    
  } catch (error) {
    console.error('❌ Error generating migration:', error.message);
  }
}

generateMigration();
