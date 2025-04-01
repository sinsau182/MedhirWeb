import { pgTable, text, serial, integer, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Employee table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

// Leave request table
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  typeOfLeave: text("type_of_leave").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  leaveBalance: integer("leave_balance").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Profile update request table
export const profileUpdates = pgTable("profile_updates", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  updateType: text("update_type").notNull(),
  currentValue: text("current_value").notNull(),
  newValue: text("new_value").notNull(),
  requestDate: date("request_date").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProfileUpdateSchema = createInsertSchema(profileUpdates).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Expense request table
export const expenseRequests = pgTable("expense_requests", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  expenseType: text("expense_type").notNull(),
  amount: numeric("amount").notNull(),
  dateSubmitted: date("date_submitted").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExpenseRequestSchema = createInsertSchema(expenseRequests).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Advance request table
export const advanceRequests = pgTable("advance_requests", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  amount: numeric("amount").notNull(),
  requestDate: date("request_date").notNull(),
  reason: text("reason").notNull(),
  repaymentPlan: text("repayment_plan").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdvanceRequestSchema = createInsertSchema(advanceRequests).omit({
  id: true,
  status: true,
  createdAt: true,
});
