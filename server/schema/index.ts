// Export all tables and types
export * from './departments';
export * from './users';
export * from './attendance';
export * from './leave';
export * from './payroll';
export * from './performance';

// Export relations for Drizzle
import { relations } from 'drizzle-orm';
import { 
  usersTable, 
  departmentsTable, 
  attendanceTable, 
  leaveTable, 
  payrollTable, 
  performanceTable 
} from '.';

// Define relationships
export const departmentsRelations = relations(departmentsTable, ({ one, many }) => ({
  head: one(usersTable, {
    fields: [departmentsTable.headId],
    references: [usersTable.id],
  }),
  employees: many(usersTable),
}));

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  department: one(departmentsTable, {
    fields: [usersTable.departmentId],
    references: [departmentsTable.id],
  }),
  manager: one(usersTable, {
    fields: [usersTable.managerId],
    references: [usersTable.id],
    relationName: 'manager',
  }),
  subordinates: many(usersTable, {
    relationName: 'manager',
  }),
  attendance: many(attendanceTable),
  leave: many(leaveTable),
  payroll: many(payrollTable),
  performanceReviews: many(performanceTable, {
    relationName: 'employee_performance',
  }),
  conductedReviews: many(performanceTable, {
    relationName: 'reviewer_performance',
  }),
}));

export const attendanceRelations = relations(attendanceTable, ({ one }) => ({
  employee: one(usersTable, {
    fields: [attendanceTable.employeeId],
    references: [usersTable.id],
  }),
  approvedBy: one(usersTable, {
    fields: [attendanceTable.approvedById],
    references: [usersTable.id],
  }),
}));

export const leaveRelations = relations(leaveTable, ({ one }) => ({
  employee: one(usersTable, {
    fields: [leaveTable.employeeId],
    references: [usersTable.id],
  }),
  approvedBy: one(usersTable, {
    fields: [leaveTable.approvedById],
    references: [usersTable.id],
  }),
}));

export const payrollRelations = relations(payrollTable, ({ one }) => ({
  employee: one(usersTable, {
    fields: [payrollTable.employeeId],
    references: [usersTable.id],
  }),
  processedBy: one(usersTable, {
    fields: [payrollTable.processedById],
    references: [usersTable.id],
  }),
}));

export const performanceRelations = relations(performanceTable, ({ one }) => ({
  employee: one(usersTable, {
    fields: [performanceTable.employeeId],
    references: [usersTable.id],
    relationName: 'employee_performance',
  }),
  reviewer: one(usersTable, {
    fields: [performanceTable.reviewerId],
    references: [usersTable.id],
    relationName: 'reviewer_performance',
  }),
}));
