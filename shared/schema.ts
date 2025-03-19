import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  height: integer("height"),
  weight: integer("weight"),
  goals: text("goals"),
  profileImage: text("profile_image"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  height: true,
  weight: true,
  goals: true,
  profileImage: true,
});

// Exercise model
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // e.g., strength, cardio, flexibility
  equipment: text("equipment"), // e.g., barbell, dumbbell, machine, bodyweight
  muscleGroup: text("muscle_group"), // e.g., chest, back, legs
  description: text("description"),
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  name: true,
  type: true,
  equipment: true,
  muscleGroup: true,
  description: true,
});

// Workout model
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  notes: text("notes"),
  type: text("type"), // e.g., strength, hypertrophy, cardio
  date: timestamp("date").notNull().defaultNow(),
  completed: boolean("completed").default(false),
  duration: integer("duration"), // in minutes
});

export const insertWorkoutSchema = createInsertSchema(workouts).pick({
  userId: true,
  name: true,
  notes: true,
  type: true,
  date: true,
  completed: true,
  duration: true,
});

// WorkoutExercise model (junction table between Workout and Exercise)
export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  order: integer("order").notNull(), // to maintain the order of exercises in a workout
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).pick({
  workoutId: true,
  exerciseId: true,
  order: true,
});

// ExerciseSet model (for tracking sets within an exercise in a workout)
export const exerciseSets = pgTable("exercise_sets", {
  id: serial("id").primaryKey(),
  workoutExerciseId: integer("workout_exercise_id").notNull(),
  reps: integer("reps"),
  weight: integer("weight"), // in kg
  duration: integer("duration"), // in seconds, for time-based exercises
  distance: integer("distance"), // in meters, for distance-based exercises
  completed: boolean("completed").default(false),
  setNumber: integer("set_number").notNull(), // to maintain the order of sets
});

export const insertExerciseSetSchema = createInsertSchema(exerciseSets).pick({
  workoutExerciseId: true,
  reps: true,
  weight: true,
  duration: true,
  distance: true,
  completed: true,
  setNumber: true,
});

// AI Conversation model (for storing AI coach conversations)
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  messages: jsonb("messages").notNull(), // Array of messages with role and content
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).pick({
  userId: true,
  messages: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;

export type ExerciseSet = typeof exerciseSets.$inferSelect;
export type InsertExerciseSet = z.infer<typeof insertExerciseSetSchema>;

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;

// Extended schemas for the frontend
export const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
});

export type LoginData = z.infer<typeof loginSchema>;

// Stats types for the dashboard
export type WorkoutStats = {
  workoutsThisWeek: number;
  personalRecords: number;
  activeDays: number;
  totalWeight: string; // Formatted string like "4.8k"
};
