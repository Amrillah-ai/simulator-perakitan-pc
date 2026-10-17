import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'exam_results' table with foreign key to 'users'
export const examResults = pgTable('exam_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  studentName: text('student_name').notNull(),
  studentClass: text('student_class').notNull(),
  scenarioId: text('scenario_id').notNull(),
  scenarioTitle: text('scenario_title').notNull(),
  scoreTotal: integer('score_total').notNull(),
  scoreSop: integer('score_sop').notNull(),
  scoreSafety: integer('score_safety').notNull(),
  scoreAccuracy: integer('score_accuracy').notNull(),
  scorePost: integer('score_post').notNull(),
  timeSpentSeconds: integer('time_spent_seconds').notNull(),
  grade: text('grade').notNull(),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships for 'users'
export const usersRelations = relations(users, ({ many }) => ({
  examResults: many(examResults),
}));

// Define relationships for 'exam_results'
export const examResultsRelations = relations(examResults, ({ one }) => ({
  user: one(users, {
    fields: [examResults.userId],
    references: [users.id],
  }),
}));
