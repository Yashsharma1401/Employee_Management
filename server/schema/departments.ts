import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  timestamp, 
  boolean,
  numeric,
  varchar,
  index
} from 'drizzle-orm/pg-core';

export const departmentsTable = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  headId: integer('head_id'),
  budget: numeric('budget', { precision: 15, scale: 2 }).default('0'),
  location: varchar('location', { length: 255 }),
  isActive: boolean('is_active').default(true),
  establishedDate: timestamp('established_date', { withTimezone: true }).defaultNow(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('departments_name_idx').on(table.name),
  headIdx: index('departments_head_idx').on(table.headId),
}));

// Export types
export type Department = typeof departmentsTable.$inferSelect;
export type NewDepartment = typeof departmentsTable.$inferInsert;
