import { neon } from "@neondatabase/serverless";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const existingDepartments = await sql`SELECT COUNT(*) as count FROM departments LIMIT 1`;
    if (parseInt(existingDepartments[0].count) > 0) {
      console.log('📦 Database already seeded. Skipping...');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Welcome@123', 12);

    // Create departments
    console.log('📁 Creating departments...');
    await sql`
      INSERT INTO departments (name, description, budget, location, established_date) VALUES
      ('Information Technology', 'Responsible for all technology infrastructure and software development', 500000, 'Building A, Floor 3', '2020-01-01'),
      ('Human Resources', 'Manages employee relations, recruitment, and organizational development', 200000, 'Building B, Floor 1', '2020-01-01'),
      ('Finance', 'Handles financial planning, accounting, and budgeting', 300000, 'Building B, Floor 2', '2020-01-01'),
      ('Marketing', 'Develops marketing strategies and manages brand communications', 250000, 'Building A, Floor 2', '2020-01-01'),
      ('Sales', 'Drives revenue growth through client acquisition and relationship management', 400000, 'Building A, Floor 1', '2020-01-01')
    `;

    // Get department IDs
    const departments = await sql`SELECT id, name FROM departments`;
    const itDept = departments.find(d => d.name === 'Information Technology');
    const hrDept = departments.find(d => d.name === 'Human Resources');
    const financeDept = departments.find(d => d.name === 'Finance');

    console.log('📁 Created 5 departments');

    // Create users
    console.log('👥 Creating users...');
    await sql`
      INSERT INTO users (
        first_name, last_name, email, phone, password, employee_id, role, 
        department_id, designation, basic_salary, allowances, deductions, 
        status, joining_date, leave_balance
      ) VALUES
      (
        'System', 'Administrator', 'admin@company.com', '+1234567890', 
        ${hashedPassword}, 'EMP20240001', 'super_admin', ${itDept.id}, 
        'System Administrator', 120000, 20000, 5000, 'active', 
        '2020-01-01', '{"annual": 25, "sick": 15, "personal": 10}'
      ),
      (
        'Sarah', 'Johnson', 'sarah.johnson@company.com', '+1234567891', 
        ${hashedPassword}, 'EMP20240002', 'admin', ${hrDept.id}, 
        'HR Director', 95000, 15000, 3000, 'active', 
        '2020-02-01', '{"annual": 25, "sick": 15, "personal": 10}'
      ),
      (
        'Michael', 'Chen', 'michael.chen@company.com', '+1234567892', 
        ${hashedPassword}, 'EMP20240003', 'manager', ${itDept.id}, 
        'IT Manager', 85000, 12000, 2500, 'active', 
        '2020-03-01', '{"annual": 22, "sick": 12, "personal": 8}'
      ),
      (
        'David', 'Wilson', 'david.wilson@company.com', '+1234567894', 
        ${hashedPassword}, 'EMP20240005', 'employee', ${itDept.id}, 
        'Senior Software Developer', 75000, 8000, 1500, 'active', 
        '2021-01-15', '{"annual": 21, "sick": 10, "personal": 5}'
      )
    `;

    // Get user IDs
    const users = await sql`SELECT id, email FROM users`;
    const michaelId = users.find(u => u.email === 'michael.chen@company.com').id;
    const sarahId = users.find(u => u.email === 'sarah.johnson@company.com').id;
    const davidId = users.find(u => u.email === 'david.wilson@company.com').id;

    // Update David's manager
    await sql`UPDATE users SET manager_id = ${michaelId} WHERE id = ${davidId}`;

    console.log('👥 Created 4 users');

    // Update department heads
    console.log('👑 Assigning department heads...');
    await sql`UPDATE departments SET head_id = ${michaelId} WHERE name = 'Information Technology'`;
    await sql`UPDATE departments SET head_id = ${sarahId} WHERE name = 'Human Resources'`;

    console.log('✅ Department heads assigned');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('================================');
    console.log('Super Admin:');
    console.log('  Email: admin@company.com');
    console.log('  Password: Welcome@123');
    console.log('\nHR Admin:');
    console.log('  Email: sarah.johnson@company.com');
    console.log('  Password: Welcome@123');
    console.log('\nManager:');
    console.log('  Email: michael.chen@company.com');
    console.log('  Password: Welcome@123');
    console.log('\nEmployee:');
    console.log('  Email: david.wilson@company.com');
    console.log('  Password: Welcome@123');
    console.log('================================\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

seedData()
  .then(() => {
    console.log('✅ Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
