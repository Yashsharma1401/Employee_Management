import { 
  pgTable, 
  serial, 
  integer, 
  timestamp, 
  numeric,
  varchar,
  text,
  jsonb,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const performanceStatusEnum = pgEnum('performance_status', ['draft', 'submitted', 'reviewed', 'approved', 'rejected']);
export const performanceTypeEnum = pgEnum('performance_type', ['quarterly', 'half_yearly', 'annual', 'probation', 'project']);

export const performanceTable = pgTable('performance', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => usersTable.id).notNull(),
  reviewerId: integer('reviewer_id').references(() => usersTable.id).notNull(),
  
  // Review Period
  reviewType: performanceTypeEnum('review_type').notNull(),
  reviewPeriod: varchar('review_period', { length: 50 }).notNull(), // e.g., "Q1-2024"
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  
  // Goals and Objectives
  goals: jsonb('goals').$type<Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    completion: number; // percentage
    comments: string;
  }>>(),
  
  // Ratings (1-5 scale)
  ratings: jsonb('ratings').$type<{
    technical_skills: number;
    communication: number;
    teamwork: number;
    leadership: number;
    problem_solving: number;
    attendance: number;
    initiative: number;
    quality_of_work: number;
  }>(),
  
  // Overall Rating
  overallRating: numeric('overall_rating', { precision: 3, scale: 2 }),
  
  // Comments
  selfAssessment: text('self_assessment'),
  managerComments: text('manager_comments'),
  hrComments: text('hr_comments'),
  employeeFeedback: text('employee_feedback'),
  
  // Development Plans
  strengths: jsonb('strengths').$type<string[]>(),
  areasForImprovement: jsonb('areas_for_improvement').$type<string[]>(),
  trainingRecommendations: jsonb('training_recommendations').$type<Array<{
    course: string;
    provider: string;
    priority: 'high' | 'medium' | 'low';
    deadline: string;
  }>>(),
  
  // Career Development
  careerGoals: text('career_goals'),
  promotionRecommendation: varchar('promotion_recommendation', { length: 100 }),
  salaryRecommendation: jsonb('salary_recommendation').$type<{
    current: number;
    recommended: number;
    effective_date: string;
    justification: string;
  }>(),
  
  // Status and Workflow
  status: performanceStatusEnum('status').default('draft').notNull(),
  submittedDate: timestamp('submitted_date', { withTimezone: true }),
  reviewedDate: timestamp('reviewed_date', { withTimezone: true }),
  approvedDate: timestamp('approved_date', { withTimezone: true }),
  
  // Signatures/Acknowledgments
  employeeAcknowledged: timestamp('employee_acknowledged', { withTimezone: true }),
  managerSigned: timestamp('manager_signed', { withTimezone: true }),
  hrApproved: timestamp('hr_approved', { withTimezone: true }),
  
  // Additional Information
  notes: text('notes'),
  
  // Timestamps
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

// Export types
export type Performance = typeof performanceTable.$inferSelect;
export type NewPerformance = typeof performanceTable.$inferInsert;
