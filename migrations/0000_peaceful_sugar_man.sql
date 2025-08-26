CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'hr', 'manager', 'employee');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'terminated', 'on_leave');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late', 'half_day', 'work_from_home');--> statement-breakpoint
CREATE TYPE "public"."leave_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."leave_type" AS ENUM('annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid');--> statement-breakpoint
CREATE TYPE "public"."payroll_status" AS ENUM('draft', 'processed', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."performance_status" AS ENUM('draft', 'submitted', 'reviewed', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."performance_type" AS ENUM('quarterly', 'half_yearly', 'annual', 'probation', 'project');--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"head_id" integer,
	"budget" numeric(15, 2) DEFAULT '0',
	"location" varchar(255),
	"is_active" boolean DEFAULT true,
	"established_date" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password" varchar(255) NOT NULL,
	"employee_id" varchar(20) NOT NULL,
	"role" "user_role" DEFAULT 'employee' NOT NULL,
	"department_id" integer NOT NULL,
	"designation" varchar(100) NOT NULL,
	"joining_date" timestamp with time zone DEFAULT now() NOT NULL,
	"basic_salary" numeric(10, 2) NOT NULL,
	"allowances" numeric(10, 2) DEFAULT '0',
	"deductions" numeric(10, 2) DEFAULT '0',
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"manager_id" integer,
	"date_of_birth" timestamp with time zone,
	"address" jsonb,
	"emergency_contact" jsonb,
	"documents" jsonb,
	"profile_image" varchar(255) DEFAULT 'default-profile.jpg',
	"leave_balance" jsonb DEFAULT '{"annual":21,"sick":10,"personal":5}'::jsonb,
	"last_login" timestamp with time zone,
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp with time zone,
	"is_email_verified" boolean DEFAULT false,
	"email_verification_token" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"clock_in" timestamp with time zone NOT NULL,
	"clock_out" timestamp with time zone,
	"break_time" integer DEFAULT 0,
	"total_hours" numeric(4, 2) DEFAULT '0',
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"notes" varchar(200),
	"location" jsonb,
	"is_manual_entry" boolean DEFAULT false,
	"approved_by_id" integer,
	"approval_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_employee_date_unique" UNIQUE("employee_id","date")
);
--> statement-breakpoint
CREATE TABLE "leave" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"leave_type" "leave_type" NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"total_days" numeric(4, 1) NOT NULL,
	"reason" text NOT NULL,
	"status" "leave_status" DEFAULT 'pending' NOT NULL,
	"applied_date" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_by_id" integer,
	"approval_date" timestamp with time zone,
	"rejection_reason" text,
	"documents" jsonb,
	"is_emergency" boolean DEFAULT false,
	"handover_notes" text,
	"contact_during_leave" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"pay_period" varchar(20) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"basic_salary" numeric(10, 2) NOT NULL,
	"allowances" jsonb,
	"deductions" jsonb,
	"gross_salary" numeric(10, 2) NOT NULL,
	"total_deductions" numeric(10, 2) DEFAULT '0',
	"net_salary" numeric(10, 2) NOT NULL,
	"working_days" integer NOT NULL,
	"present_days" integer NOT NULL,
	"absent_days" integer DEFAULT 0,
	"overtime_hours" numeric(4, 2) DEFAULT '0',
	"status" "payroll_status" DEFAULT 'draft' NOT NULL,
	"processed_date" timestamp with time zone,
	"processed_by_id" integer,
	"payment_date" timestamp with time zone,
	"payment_method" varchar(50),
	"payment_reference" varchar(100),
	"notes" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"review_type" "performance_type" NOT NULL,
	"review_period" varchar(50) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"goals" jsonb,
	"ratings" jsonb,
	"overall_rating" numeric(3, 2),
	"self_assessment" text,
	"manager_comments" text,
	"hr_comments" text,
	"employee_feedback" text,
	"strengths" jsonb,
	"areas_for_improvement" jsonb,
	"training_recommendations" jsonb,
	"career_goals" text,
	"promotion_recommendation" varchar(100),
	"salary_recommendation" jsonb,
	"status" "performance_status" DEFAULT 'draft' NOT NULL,
	"submitted_date" timestamp with time zone,
	"reviewed_date" timestamp with time zone,
	"approved_date" timestamp with time zone,
	"employee_acknowledged" timestamp with time zone,
	"manager_signed" timestamp with time zone,
	"hr_approved" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave" ADD CONSTRAINT "leave_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave" ADD CONSTRAINT "leave_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_processed_by_id_users_id_fk" FOREIGN KEY ("processed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance" ADD CONSTRAINT "performance_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance" ADD CONSTRAINT "performance_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "departments_name_idx" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE INDEX "departments_head_idx" ON "departments" USING btree ("head_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_employee_id_idx" ON "users" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "users_department_idx" ON "users" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "users_manager_idx" ON "users" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "attendance_employee_idx" ON "attendance" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "attendance_date_idx" ON "attendance" USING btree ("date");--> statement-breakpoint
CREATE INDEX "attendance_status_idx" ON "attendance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leave_employee_idx" ON "leave" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "leave_status_idx" ON "leave" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leave_date_range_idx" ON "leave" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "leave_type_idx" ON "leave" USING btree ("leave_type");--> statement-breakpoint
CREATE INDEX "payroll_employee_idx" ON "payroll" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "payroll_pay_period_idx" ON "payroll" USING btree ("pay_period");--> statement-breakpoint
CREATE INDEX "payroll_status_idx" ON "payroll" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payroll_date_range_idx" ON "payroll" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "performance_employee_idx" ON "performance" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "performance_reviewer_idx" ON "performance" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "performance_status_idx" ON "performance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "performance_type_idx" ON "performance" USING btree ("review_type");--> statement-breakpoint
CREATE INDEX "performance_period_idx" ON "performance" USING btree ("review_period");--> statement-breakpoint
CREATE INDEX "performance_date_range_idx" ON "performance" USING btree ("start_date","end_date");