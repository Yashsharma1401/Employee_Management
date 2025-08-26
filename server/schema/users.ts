import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  timestamp, 
  jsonb,
  pgEnum,
  boolean,
  numeric,
  varchar,
  index,
  unique
} from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'admin', 'hr', 'manager', 'employee']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'terminated', 'on_leave']);

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  
  // Personal Information
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  
  // Professional Information
  employeeId: varchar('employee_id', { length: 20 }).notNull().unique(),
  role: userRoleEnum('role').default('employee').notNull(),
  departmentId: integer('department_id').references(() => departmentsTable.id).notNull(),
  designation: varchar('designation', { length: 100 }).notNull(),
  joiningDate: timestamp('joining_date', { withTimezone: true }).defaultNow().notNull(),
  
  // Salary Information
  basicSalary: numeric('basic_salary', { precision: 10, scale: 2 }).notNull(),
  allowances: numeric('allowances', { precision: 10, scale: 2 }).default('0'),
  deductions: numeric('deductions', { precision: 10, scale: 2 }).default('0'),
  
  // Employment Status
  status: userStatusEnum('status').default('active').notNull(),
  
  // Manager Information
  managerId: integer('manager_id').references(() => usersTable.id),
  
  // Personal Details
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  address: jsonb('address').$type<{
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }>(),
  emergencyContact: jsonb('emergency_contact').$type<{
    name?: string;
    relationship?: string;
    phone?: string;
  }>(),
  
  // Documents
  documents: jsonb('documents').$type<Array<{
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }>>(),
  
  // Profile Image
  profileImage: varchar('profile_image', { length: 255 }).default('default-profile.jpg'),
  
  // Leave Balance
  leaveBalance: jsonb('leave_balance').$type<{
    annual: number;
    sick: number;
    personal: number;
  }>().default({ annual: 21, sick: 10, personal: 5 }),
  
  // Last Login
  lastLogin: timestamp('last_login', { withTimezone: true }),
  
  // Password Reset
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires', { withTimezone: true }),
  
  // Account Settings
  isEmailVerified: boolean('is_email_verified').default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  employeeIdIdx: index('users_employee_id_idx').on(table.employeeId),
  departmentIdx: index('users_department_idx').on(table.departmentId),
  managerIdx: index('users_manager_idx').on(table.managerId),
}));

// Import departments table (forward reference)
import { departmentsTable } from './departments';

// Export types
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
