// Direct schema definitions to avoid circular imports
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
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late', 'half_day', 'work_from_home']);
export const leaveTypeEnum = pgEnum('leave_type', ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid']);
export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'rejected', 'cancelled']);
export const payrollStatusEnum = pgEnum('payroll_status', ['draft', 'processed', 'paid', 'cancelled']);
export const performanceStatusEnum = pgEnum('performance_status', ['draft', 'submitted', 'reviewed', 'approved', 'rejected']);
export const performanceTypeEnum = pgEnum('performance_type', ['quarterly', 'half_yearly', 'annual', 'probation', 'project']);

// Departments Table
export const departmentsTable = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  headId: integer('head_id'),
  budget: numeric('budget', { precision: 15, scale: 2 }).default('0'),
  location: varchar('location', { length: 255 }),
  isActive: boolean('is_active').default(true),
  establishedDate: timestamp('established_date', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('departments_name_idx').on(table.name),
  headIdx: index('departments_head_idx').on(table.headId),
}));

// Users Table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  employeeId: varchar('employee_id', { length: 20 }).notNull().unique(),
  role: userRoleEnum('role').default('employee').notNull(),
  departmentId: integer('department_id').references(() => departmentsTable.id).notNull(),
  designation: varchar('designation', { length: 100 }).notNull(),
  joiningDate: timestamp('joining_date', { withTimezone: true }).defaultNow().notNull(),
  basicSalary: numeric('basic_salary', { precision: 10, scale: 2 }).notNull(),
  allowances: numeric('allowances', { precision: 10, scale: 2 }).default('0'),
  deductions: numeric('deductions', { precision: 10, scale: 2 }).default('0'),
  status: userStatusEnum('status').default('active').notNull(),
  managerId: integer('manager_id').references(() => usersTable.id),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  address: jsonb('address'),
  emergencyContact: jsonb('emergency_contact'),
  documents: jsonb('documents'),
  profileImage: varchar('profile_image', { length: 255 }).default('default-profile.jpg'),
  leaveBalance: jsonb('leave_balance').default({ annual: 21, sick: 10, personal: 5 }),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires', { withTimezone: true }),
  isEmailVerified: boolean('is_email_verified').default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  employeeIdIdx: index('users_employee_id_idx').on(table.employeeId),
  departmentIdx: index('users_department_idx').on(table.departmentId),
  managerIdx: index('users_manager_idx').on(table.managerId),
}));

// Attendance Table
export const attendanceTable = pgTable('attendance', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => usersTable.id).notNull(),
  date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
  clockIn: timestamp('clock_in', { withTimezone: true }).notNull(),
  clockOut: timestamp('clock_out', { withTimezone: true }),
  breakTime: integer('break_time').default(0),
  totalHours: numeric('total_hours', { precision: 4, scale: 2 }).default('0'),
  status: attendanceStatusEnum('status').default('present').notNull(),
  notes: varchar('notes', { length: 200 }),
  location: jsonb('location'),
  isManualEntry: boolean('is_manual_entry').default(false),
  approvedById: integer('approved_by_id').references(() => usersTable.id),
  approvalDate: timestamp('approval_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  employeeIdx: index('attendance_employee_idx').on(table.employeeId),
  dateIdx: index('attendance_date_idx').on(table.date),
  statusIdx: index('attendance_status_idx').on(table.status),
  employeeDateUnique: unique('attendance_employee_date_unique').on(table.employeeId, table.date),
}));

// Leave Table
export const leaveTable = pgTable('leave', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => usersTable.id).notNull(),
  leaveType: leaveTypeEnum('leave_type').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  totalDays: numeric('total_days', { precision: 4, scale: 1 }).notNull(),
  reason: text('reason').notNull(),
  status: leaveStatusEnum('status').default('pending').notNull(),
  appliedDate: timestamp('applied_date', { withTimezone: true }).defaultNow().notNull(),
  approvedById: integer('approved_by_id').references(() => usersTable.id),
  approvalDate: timestamp('approval_date', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  documents: jsonb('documents'),
  isEmergency: boolean('is_emergency').default(false),
  handoverNotes: text('handover_notes'),
  contactDuringLeave: jsonb('contact_during_leave'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  employeeIdx: index('leave_employee_idx').on(table.employeeId),
  statusIdx: index('leave_status_idx').on(table.status),
  dateRangeIdx: index('leave_date_range_idx').on(table.startDate, table.endDate),
  typeIdx: index('leave_type_idx').on(table.leaveType),
}));

// Payroll Table
export const payrollTable = pgTable('payroll', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => usersTable.id).notNull(),
  payPeriod: varchar('pay_period', { length: 20 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  basicSalary: numeric('basic_salary', { precision: 10, scale: 2 }).notNull(),
  allowances: jsonb('allowances'),
  deductions: jsonb('deductions'),
  grossSalary: numeric('gross_salary', { precision: 10, scale: 2 }).notNull(),
  totalDeductions: numeric('total_deductions', { precision: 10, scale: 2 }).default('0'),
  netSalary: numeric('net_salary', { precision: 10, scale: 2 }).notNull(),
  workingDays: integer('working_days').notNull(),
  presentDays: integer('present_days').notNull(),
  absentDays: integer('absent_days').default(0),
  overtimeHours: numeric('overtime_hours', { precision: 4, scale: 2 }).default('0'),
  status: payrollStatusEnum('status').default('draft').notNull(),
  processedDate: timestamp('processed_date', { withTimezone: true }),
  processedById: integer('processed_by_id').references(() => usersTable.id),
  paymentDate: timestamp('payment_date', { withTimezone: true }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentReference: varchar('payment_reference', { length: 100 }),
  notes: varchar('notes', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  employeeIdx: index('payroll_employee_idx').on(table.employeeId),
  payPeriodIdx: index('payroll_pay_period_idx').on(table.payPeriod),
  statusIdx: index('payroll_status_idx').on(table.status),
  dateRangeIdx: index('payroll_date_range_idx').on(table.startDate, table.endDate),
}));

// Performance Table
export const performanceTable = pgTable('performance', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => usersTable.id).notNull(),
  reviewerId: integer('reviewer_id').references(() => usersTable.id).notNull(),
  reviewType: performanceTypeEnum('review_type').notNull(),
  reviewPeriod: varchar('review_period', { length: 50 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  goals: jsonb('goals'),
  ratings: jsonb('ratings'),
  overallRating: numeric('overall_rating', { precision: 3, scale: 2 }),
  selfAssessment: text('self_assessment'),
  managerComments: text('manager_comments'),
  hrComments: text('hr_comments'),
  employeeFeedback: text('employee_feedback'),
  strengths: jsonb('strengths'),
  areasForImprovement: jsonb('areas_for_improvement'),
  trainingRecommendations: jsonb('training_recommendations'),
  careerGoals: text('career_goals'),
  promotionRecommendation: varchar('promotion_recommendation', { length: 100 }),
  salaryRecommendation: jsonb('salary_recommendation'),
  status: performanceStatusEnum('status').default('draft').notNull(),
  submittedDate: timestamp('submitted_date', { withTimezone: true }),
  reviewedDate: timestamp('reviewed_date', { withTimezone: true }),
  approvedDate: timestamp('approved_date', { withTimezone: true }),
  employeeAcknowledged: timestamp('employee_acknowledged', { withTimezone: true }),
  managerSigned: timestamp('manager_signed', { withTimezone: true }),
  hrApproved: timestamp('hr_approved', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  employeeIdx: index('performance_employee_idx').on(table.employeeId),
  reviewerIdx: index('performance_reviewer_idx').on(table.reviewerId),
  statusIdx: index('performance_status_idx').on(table.status),
  typeIdx: index('performance_type_idx').on(table.reviewType),
  periodIdx: index('performance_period_idx').on(table.reviewPeriod),
  dateRangeIdx: index('performance_date_range_idx').on(table.startDate, table.endDate),
}));

// Table schemas exported above
// Types can be inferred in TypeScript files using:
// type User = typeof usersTable.$inferSelect;
// type NewUser = typeof usersTable.$inferInsert;
