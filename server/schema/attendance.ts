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
  index,
  unique,
  pgEnum
} from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late', 'half_day', 'work_from_home']);

export const attendanceTable = pgTable('attendance', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => usersTable.id).notNull(),
  date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
  clockIn: timestamp('clock_in', { withTimezone: true }).notNull(),
  clockOut: timestamp('clock_out', { withTimezone: true }),
  breakTime: integer('break_time').default(0), // in minutes
  totalHours: numeric('total_hours', { precision: 4, scale: 2 }).default('0'),
  status: attendanceStatusEnum('status').default('present').notNull(),
  notes: varchar('notes', { length: 200 }),
  location: jsonb('location').$type<{
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  }>(),
  isManualEntry: boolean('is_manual_entry').default(false),
  approvedById: integer('approved_by_id').references(() => usersTable.id),
  approvalDate: timestamp('approval_date', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  employeeIdx: index('attendance_employee_idx').on(table.employeeId),
  dateIdx: index('attendance_date_idx').on(table.date),
  statusIdx: index('attendance_status_idx').on(table.status),
  employeeDateUnique: unique('attendance_employee_date_unique').on(table.employeeId, table.date),
}));


// Export types
export type Attendance = typeof attendanceTable.$inferSelect;
export type NewAttendance = typeof attendanceTable.$inferInsert;
