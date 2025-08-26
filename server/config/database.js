import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from '../schema/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  console.log('📝 Please set your Neon database URL in .env file');
  process.exit(1);
}

// Create Neon SQL client
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle instance with Neon HTTP adapter
export const db = drizzle({ client: sql, schema });

// Test connection function
export const connectDB = async () => {
  try {
    // Test the connection by running a simple query
    await sql`SELECT 1 as test`;
    console.log('✅ Neon PostgreSQL Connected Successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('📝 Please check your DATABASE_URL and ensure Neon is accessible');
    return false;
  }
};

export default db;
