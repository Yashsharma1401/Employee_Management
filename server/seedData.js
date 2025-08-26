import { db } from './config/database.js';
import { departmentsTable, usersTable } from './schema/index.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const existingDepartments = await db.select().from(departmentsTable).limit(1);
    if (existingDepartments.length > 0) {
      console.log('📦 Database already seeded. Skipping...');
      return;
    }

    // Create departments
    console.log('📁 Creating departments...');
    const departments = await db
      .insert(departmentsTable)
      .values([
        {
          name: 'Information Technology',
          description: 'Responsible for all technology infrastructure and software development',
          budget: 500000,
          location: 'Building A, Floor 3',
          establishedDate: new Date('2020-01-01')
        },
        {
          name: 'Human Resources',
          description: 'Manages employee relations, recruitment, and organizational development',
          budget: 200000,
          location: 'Building B, Floor 1',
          establishedDate: new Date('2020-01-01')
        },
        {
          name: 'Finance',
          description: 'Handles financial planning, accounting, and budgeting',
          budget: 300000,
          location: 'Building B, Floor 2',
          establishedDate: new Date('2020-01-01')
        },
        {
          name: 'Marketing',
          description: 'Develops marketing strategies and manages brand communications',
          budget: 250000,
          location: 'Building A, Floor 2',
          establishedDate: new Date('2020-01-01')
        },
        {
          name: 'Sales',
          description: 'Drives revenue growth through client acquisition and relationship management',
          budget: 400000,
          location: 'Building A, Floor 1',
          establishedDate: new Date('2020-01-01')
        }
      ])
      .returning();

    console.log(`✅ Created ${departments.length} departments`);

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('Welcome@123', 12);

    const users = await db
      .insert(usersTable)
      .values([
        // Super Admin
        {
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@company.com',
          phone: '+1234567890',
          password: hashedPassword,
          employeeId: 'EMP20240001',
          role: 'super_admin',
          departmentId: departments.find(d => d.name === 'Information Technology').id,
          designation: 'System Administrator',
          basicSalary: 120000,
          allowances: 20000,
          deductions: 5000,
          status: 'active',
          joiningDate: new Date('2020-01-01'),
          leaveBalance: { annual: 25, sick: 15, personal: 10 }
        },
        // HR Admin
        {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1234567891',
          password: hashedPassword,
          employeeId: 'EMP20240002',
          role: 'admin',
          departmentId: departments.find(d => d.name === 'Human Resources').id,
          designation: 'HR Director',
          basicSalary: 95000,
          allowances: 15000,
          deductions: 3000,
          status: 'active',
          joiningDate: new Date('2020-02-01'),
          leaveBalance: { annual: 25, sick: 15, personal: 10 }
        },
        // IT Manager
        {
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@company.com',
          phone: '+1234567892',
          password: hashedPassword,
          employeeId: 'EMP20240003',
          role: 'manager',
          departmentId: departments.find(d => d.name === 'Information Technology').id,
          designation: 'IT Manager',
          basicSalary: 85000,
          allowances: 12000,
          deductions: 2500,
          status: 'active',
          joiningDate: new Date('2020-03-01'),
          leaveBalance: { annual: 22, sick: 12, personal: 8 }
        },
        // Finance Manager
        {
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@company.com',
          phone: '+1234567893',
          password: hashedPassword,
          employeeId: 'EMP20240004',
          role: 'manager',
          departmentId: departments.find(d => d.name === 'Finance').id,
          designation: 'Finance Manager',
          basicSalary: 80000,
          allowances: 10000,
          deductions: 2000,
          status: 'active',
          joiningDate: new Date('2020-04-01'),
          leaveBalance: { annual: 22, sick: 12, personal: 8 }
        },
        // Software Developer
        {
          firstName: 'David',
          lastName: 'Wilson',
          email: 'david.wilson@company.com',
          phone: '+1234567894',
          password: hashedPassword,
          employeeId: 'EMP20240005',
          role: 'employee',
          departmentId: departments.find(d => d.name === 'Information Technology').id,
          designation: 'Senior Software Developer',
          managerId: 3, // Michael Chen
          basicSalary: 75000,
          allowances: 8000,
          deductions: 1500,
          status: 'active',
          joiningDate: new Date('2021-01-15'),
          leaveBalance: { annual: 21, sick: 10, personal: 5 }
        },
        // HR Specialist
        {
          firstName: 'Lisa',
          lastName: 'Brown',
          email: 'lisa.brown@company.com',
          phone: '+1234567895',
          password: hashedPassword,
          employeeId: 'EMP20240006',
          role: 'hr',
          departmentId: departments.find(d => d.name === 'Human Resources').id,
          designation: 'HR Specialist',
          managerId: 2, // Sarah Johnson
          basicSalary: 60000,
          allowances: 6000,
          deductions: 1200,
          status: 'active',
          joiningDate: new Date('2021-03-01'),
          leaveBalance: { annual: 21, sick: 10, personal: 5 }
        },
        // Marketing Specialist
        {
          firstName: 'John',
          lastName: 'Martinez',
          email: 'john.martinez@company.com',
          phone: '+1234567896',
          password: hashedPassword,
          employeeId: 'EMP20240007',
          role: 'employee',
          departmentId: departments.find(d => d.name === 'Marketing').id,
          designation: 'Marketing Specialist',
          basicSalary: 55000,
          allowances: 5000,
          deductions: 1000,
          status: 'active',
          joiningDate: new Date('2021-06-01'),
          leaveBalance: { annual: 21, sick: 10, personal: 5 }
        },
        // Sales Representative
        {
          firstName: 'Jessica',
          lastName: 'Taylor',
          email: 'jessica.taylor@company.com',
          phone: '+1234567897',
          password: hashedPassword,
          employeeId: 'EMP20240008',
          role: 'employee',
          departmentId: departments.find(d => d.name === 'Sales').id,
          designation: 'Sales Representative',
          basicSalary: 50000,
          allowances: 8000,
          deductions: 1000,
          status: 'active',
          joiningDate: new Date('2021-09-01'),
          leaveBalance: { annual: 21, sick: 10, personal: 5 }
        },
        // Junior Developer
        {
          firstName: 'Alex',
          lastName: 'Rodriguez',
          email: 'alex.rodriguez@company.com',
          phone: '+1234567898',
          password: hashedPassword,
          employeeId: 'EMP20240009',
          role: 'employee',
          departmentId: departments.find(d => d.name === 'Information Technology').id,
          designation: 'Junior Software Developer',
          managerId: 3, // Michael Chen
          basicSalary: 45000,
          allowances: 4000,
          deductions: 800,
          status: 'active',
          joiningDate: new Date('2022-01-01'),
          leaveBalance: { annual: 21, sick: 10, personal: 5 }
        },
        // Accountant
        {
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.garcia@company.com',
          phone: '+1234567899',
          password: hashedPassword,
          employeeId: 'EMP20240010',
          role: 'employee',
          departmentId: departments.find(d => d.name === 'Finance').id,
          designation: 'Senior Accountant',
          managerId: 4, // Emily Davis
          basicSalary: 58000,
          allowances: 5500,
          deductions: 1100,
          status: 'active',
          joiningDate: new Date('2022-03-01'),
          leaveBalance: { annual: 21, sick: 10, personal: 5 }
        }
      ])
      .returning();

    console.log(`✅ Created ${users.length} users`);

    // Update department heads
    console.log('👑 Assigning department heads...');
    
    await db
      .update(departmentsTable)
      .set({ headId: users.find(u => u.email === 'michael.chen@company.com').id })
      .where(eq(departmentsTable.name, 'Information Technology'));

    await db
      .update(departmentsTable)
      .set({ headId: users.find(u => u.email === 'sarah.johnson@company.com').id })
      .where(eq(departmentsTable.name, 'Human Resources'));

    await db
      .update(departmentsTable)
      .set({ headId: users.find(u => u.email === 'emily.davis@company.com').id })
      .where(eq(departmentsTable.name, 'Finance'));

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

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedData;
