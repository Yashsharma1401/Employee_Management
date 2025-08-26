import { 
  pgTable, 
  serial, 
  integer, 
  timestamp, 
  numeric,
  varchar,
  text,
  boolean,
  jsonb,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const leaveTypeEnum = pgEnum('leave_type', ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid']);
export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'rejected', 'cancelled']);

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
  documents: jsonb('documents').$type<Array<{
    name: string;
    url: string;
    uploadDate: string;
  }>>(),
  isEmergency: boolean('is_emergency').default(false),
  handoverNotes: text('handover_notes'),
  contactDuringLeave: jsonb('contact_during_leave').$type<{
    phone?: string;
    email?: string;
    address?: string;
  }>(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  employeeIdx: index('leave_employee_idx').on(table.employeeId),
  statusIdx: index('leave_status_idx').on(table.status),
  dateRangeIdx: index('leave_date_range_idx').on(table.startDate, table.endDate),
  typeIdx: index('leave_type_idx').on(table.leaveType),
}));

// Export types
export type Leave = typeof leaveTable.$inferSelect;
export type NewLeave = typeof leaveTable.$inferInsert;
