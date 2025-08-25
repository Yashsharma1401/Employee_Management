import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Department from './models/Department.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await Department.deleteMany({});
    await User.deleteMany({});

    console.log('Existing data cleared...');

    // Create Departments
    const departments = await Department.create([
      {
        name: 'Information Technology',
        description: 'Software development and IT infrastructure',
        budget: 500000,
        location: 'Building A, Floor 3',
      },
      {
        name: 'Human Resources',
        description: 'Employee relations and talent management',
        budget: 200000,
        location: 'Building A, Floor 1',
      },
      {
        name: 'Finance',
        description: 'Financial planning and accounting',
        budget: 300000,
        location: 'Building A, Floor 2',
      },
      {
        name: 'Marketing',
        description: 'Brand promotion and customer engagement',
        budget: 250000,
        location: 'Building B, Floor 1',
      },
      {
        name: 'Operations',
        description: 'Business operations and logistics',
        budget: 350000,
        location: 'Building B, Floor 2',
      },
    ]);

    console.log('Departments created...');

    // Create Users
    const users = await User.create([
      // Super Admin
      {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@ems.com',
        phone: '+1234567890',
        password: 'admin123',
        employeeId: 'EMP20240001',
        role: 'super_admin',
        department: departments[0]._id,
        designation: 'System Administrator',
        salary: {
          basic: 150000,
          allowances: 30000,
          deductions: 15000,
        },
        joiningDate: new Date('2024-01-01'),
        address: {
          street: '123 Admin Street',
          city: 'Tech City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
      },
      // HR Manager
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@ems.com',
        phone: '+1234567891',
        password: 'hr123',
        employeeId: 'EMP20240002',
        role: 'hr',
        department: departments[1]._id,
        designation: 'HR Manager',
        salary: {
          basic: 80000,
          allowances: 15000,
          deductions: 8000,
        },
        joiningDate: new Date('2024-01-15'),
        address: {
          street: '456 HR Avenue',
          city: 'Tech City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
      },
      // IT Manager
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@ems.com',
        phone: '+1234567892',
        password: 'manager123',
        employeeId: 'EMP20240003',
        role: 'manager',
        department: departments[0]._id,
        designation: 'IT Manager',
        salary: {
          basic: 90000,
          allowances: 18000,
          deductions: 9000,
        },
        joiningDate: new Date('2024-02-01'),
        address: {
          street: '789 Tech Boulevard',
          city: 'Tech City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
      },
      // Employee 1
      {
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'employee@ems.com',
        phone: '+1234567893',
        password: 'emp123',
        employeeId: 'EMP20240004',
        role: 'employee',
        department: departments[0]._id,
        designation: 'Software Developer',
        salary: {
          basic: 75000,
          allowances: 10000,
          deductions: 7500,
        },
        joiningDate: new Date('2024-03-01'),
        address: {
          street: '321 Developer Lane',
          city: 'Tech City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
      },
      // Employee 2
      {
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'bob.brown@ems.com',
        phone: '+1234567894',
        password: 'emp123',
        employeeId: 'EMP20240005',
        role: 'employee',
        department: departments[2]._id,
        designation: 'Financial Analyst',
        salary: {
          basic: 65000,
          allowances: 8000,
          deductions: 6500,
        },
        joiningDate: new Date('2024-03-15'),
        address: {
          street: '654 Finance Street',
          city: 'Tech City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
      },
      // Employee 3
      {
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol.davis@ems.com',
        phone: '+1234567895',
        password: 'emp123',
        employeeId: 'EMP20240006',
        role: 'employee',
        department: departments[3]._id,
        designation: 'Marketing Specialist',
        salary: {
          basic: 60000,
          allowances: 7000,
          deductions: 6000,
        },
        joiningDate: new Date('2024-04-01'),
        address: {
          street: '987 Marketing Plaza',
          city: 'Tech City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
      },
    ]);

    // Set managers
    const itManager = users.find(u => u.email === 'john.smith@ems.com');
    
    // Update employees with managers
    await User.findByIdAndUpdate(users[3]._id, { manager: itManager._id });
    
    // Update department heads
    await Department.findByIdAndUpdate(departments[0]._id, { head: itManager._id });
    await Department.findByIdAndUpdate(departments[1]._id, { head: users[1]._id });

    console.log('Users created and managers assigned...');
    console.log('\n=== DEMO CREDENTIALS ===');
    console.log('Admin: admin@ems.com / admin123');
    console.log('HR: sarah.johnson@ems.com / hr123');
    console.log('Manager: john.smith@ems.com / manager123');
    console.log('Employee: employee@ems.com / emp123');
    console.log('========================\n');

    mongoose.connection.close();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedData();
};

run();
