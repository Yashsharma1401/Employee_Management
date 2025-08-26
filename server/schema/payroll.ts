import { 
  pgTable, 
  serial, 
  integer, 
  timestamp, 
  numeric,
  varchar,
  jsonb,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const payrollStatusEnum = pgEnum('payroll_status', ['draft', 'processed', 'paid', 'cancelled']);

export const payrollTable = pgTable('payroll', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => usersTable.id).notNull(),
  payPeriod: varchar('pay_period', { length: 20 }).notNull(), // e.g., "2024-01"
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  
  // Salary Components
  basicSalary: numeric('basic_salary', { precision: 10, scale: 2 }).notNull(),
  allowances: jsonb('allowances').$type<{
    hra?: number;
    transport?: number;
    meal?: number;
    bonus?: number;
    overtime?: number;
    other?: number;
  }>(),
  deductions: jsonb('deductions').$type<{
    tax?: number;
    pf?: number;
    insurance?: number;
    loan?: number;
    other?: number;
  }>(),
  
  // Calculated Fields
  grossSalary: numeric('gross_salary', { precision: 10, scale: 2 }).notNull(),
  totalDeductions: numeric('total_deductions', { precision: 10, scale: 2 }).default('0'),
  netSalary: numeric('net_salary', { precision: 10, scale: 2 }).notNull(),
  
  // Attendance Based
  workingDays: integer('working_days').notNull(),
  presentDays: integer('present_days').notNull(),
  absentDays: integer('absent_days').default(0),
  overtimeHours: numeric('overtime_hours', { precision: 4, scale: 2 }).default('0'),
  
  // Processing Information
  status: payrollStatusEnum('status').default('draft').notNull(),
  processedDate: timestamp('processed_date', { withTimezone: true }),
  processedById: integer('processed_by_id').references(() => usersTable.id),
  paymentDate: timestamp('payment_date', { withTimezone: true }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentReference: varchar('payment_reference', { length: 100 }),
  
  // Additional Information
  notes: varchar('notes', { length: 500 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  employeeIdx: index('payroll_employee_idx').on(table.employeeId),
  payPeriodIdx: index('payroll_pay_period_idx').on(table.payPeriod),
  statusIdx: index('payroll_status_idx').on(table.status),
  dateRangeIdx: index('payroll_date_range_idx').on(table.startDate, table.endDate),
}));

// Export types
export type Payroll = typeof payrollTable.$inferSelect;
export type NewPayroll = typeof payrollTable.$inferInsert;
