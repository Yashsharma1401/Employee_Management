// MongoDB Shell Script - Run this in MongoDB Compass or mongo shell
// Connect to: mongodb://localhost:27017/employee_management

// Switch to employee_management database
db = db.getSiblingDB('employee_management');

// Clear existing data
db.departments.deleteMany({});
db.users.deleteMany({});

// Insert departments
const departments = [
  {
    name: "Engineering",
    description: "Software development and technical operations",
    budget: 500000,
    location: "Building A, Floor 3",
    isActive: true,
    establishedDate: new Date("2020-01-15"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Human Resources", 
    description: "Employee relations and organizational development",
    budget: 200000,
    location: "Building B, Floor 1",
    isActive: true,
    establishedDate: new Date("2019-03-10"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Marketing",
    description: "Brand promotion and customer engagement", 
    budget: 300000,
    location: "Building A, Floor 2",
    isActive: true,
    establishedDate: new Date("2020-06-01"),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.departments.insertMany(departments);

// Get department IDs for reference
const engDept = db.departments.findOne({name: "Engineering"});
const hrDept = db.departments.findOne({name: "Human Resources"});

// Insert test users (password is 'admin123' for all)
const users = [
  {
    firstName: "Admin",
    lastName: "User", 
    email: "admin@company.com",
    phone: "+1234567890",
    employeeId: "EMP001",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LbynAmH4P4y5OP6i.",
    role: "admin",
    department: engDept._id,
    designation: "System Administrator",
    joiningDate: new Date("2020-01-01"),
    salary: {
      basic: 80000,
      allowances: 20000,
      deductions: 5000
    },
    status: "active",
    profileImage: "",
    leaveBalance: {
      annual: 25,
      sick: 10,
      personal: 5
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com", 
    phone: "+1234567891",
    employeeId: "EMP002",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LbynAmH4P4y5OP6i.",
    role: "employee",
    department: engDept._id,
    designation: "Software Engineer",
    joiningDate: new Date("2021-03-15"),
    salary: {
      basic: 75000,
      allowances: 15000,
      deductions: 3000
    },
    status: "active",
    profileImage: "",
    leaveBalance: {
      annual: 20,
      sick: 8,
      personal: 3
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@company.com",
    phone: "+1234567892", 
    employeeId: "EMP003",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LbynAmH4P4y5OP6i.",
    role: "hr",
    department: hrDept._id,
    designation: "HR Manager",
    joiningDate: new Date("2020-08-01"),
    salary: {
      basic: 70000,
      allowances: 18000,
      deductions: 4000
    },
    status: "active",
    profileImage: "",
    leaveBalance: {
      annual: 22,
      sick: 9,
      personal: 4
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.users.insertMany(users);

print("✅ Seed data inserted successfully!");
print("👤 Login credentials:");
print("   Admin: admin@company.com / admin123");
print("   Employee: john.doe@company.com / admin123");
print("   HR: jane.smith@company.com / admin123");
