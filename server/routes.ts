import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupGeminiRoutes } from "./gemini";
import { 
  insertExerciseSchema, 
  insertWorkoutSchema, 
  insertWorkoutExerciseSchema, 
  insertExerciseSetSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Set up AI coach (Gemini) routes
  setupGeminiRoutes(app);

  // Exercises routes
  app.get("/api/exercises", async (_req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const validation = insertExerciseSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: fromZodError(validation.error).message 
        });
      }
      const exercise = await storage.createExercise(validation.data);
      res.status(201).json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  // Workouts routes
  app.get("/api/workouts", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const workouts = await storage.getWorkoutsByUserId(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const workout = await storage.getWorkoutById(workoutId);
      
      if (!workout || workout.userId !== userId) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      const workoutExercises = await storage.getWorkoutExercisesByWorkoutId(workoutId);
      
      const exercises = [];
      for (const workoutExercise of workoutExercises) {
        const exercise = await storage.getExerciseById(workoutExercise.exerciseId);
        const sets = await storage.getExerciseSetsByWorkoutExerciseId(workoutExercise.id);
        if (exercise) {
          exercises.push({
            exercise,
            sets
          });
        }
      }
      
      res.json({
        workout,
        exercises
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { workout: workoutData, exercises } = req.body;
      
      // Validate workout data
      const validatedWorkout = { ...workoutData, userId };
      const workoutValidation = insertWorkoutSchema.safeParse(validatedWorkout);
      
      if (!workoutValidation.success) {
        return res.status(400).json({ 
          message: fromZodError(workoutValidation.error).message 
        });
      }
      
      // Create workout
      const workout = await storage.createWorkout(workoutValidation.data);
      
      // Create exercises and sets
      for (let i = 0; i < exercises.length; i++) {
        const { exercise, sets } = exercises[i];
        
        // Create workout exercise (junction)
        const workoutExercise = await storage.createWorkoutExercise({
          workoutId: workout.id,
          exerciseId: exercise.id,
          order: i + 1
        });
        
        // Create sets for this exercise
        for (const set of sets) {
          await storage.createExerciseSet({
            ...set,
            workoutExerciseId: workoutExercise.id
          });
        }
      }
      
      res.status(201).json({ workout });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  app.put("/api/workouts/:id", async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const workout = await storage.getWorkoutById(workoutId);
      
      if (!workout || workout.userId !== userId) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      const { workout: workoutData, exercises } = req.body;
      
      // Update workout
      await storage.updateWorkout(workoutId, { ...workoutData, userId });
      
      // Delete existing workout exercises and sets
      const workoutExercises = await storage.getWorkoutExercisesByWorkoutId(workoutId);
      for (const workoutExercise of workoutExercises) {
        await storage.deleteExerciseSetsByWorkoutExerciseId(workoutExercise.id);
        await storage.deleteWorkoutExercise(workoutExercise.id);
      }
      
      // Create new workout exercises and sets
      for (let i = 0; i < exercises.length; i++) {
        const { exercise, sets } = exercises[i];
        
        // Create workout exercise (junction)
        const workoutExercise = await storage.createWorkoutExercise({
          workoutId,
          exerciseId: exercise.id,
          order: i + 1
        });
        
        // Create sets for this exercise
        for (const set of sets) {
          await storage.createExerciseSet({
            ...set,
            workoutExerciseId: workoutExercise.id
          });
        }
      }
      
      res.json({ message: "Workout updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  app.get("/api/workouts/history", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const period = req.query.period as string || 'all';
      const workouts = await storage.getWorkoutHistory(userId, period);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout history" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get dashboard data
      const user = req.user;
      const stats = await storage.getUserStats(userId);
      const recentWorkouts = await storage.getRecentWorkouts(userId, 5);
      const lastWorkout = recentWorkouts.length > 0 ? recentWorkouts[0] : null;
      const progressData = await storage.getProgressData(userId);
      
      res.json({
        user,
        stats,
        recentWorkouts,
        lastWorkout,
        progressData
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Progress data
  app.get("/api/progress", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const progressData = await storage.getProgressData(userId);
      res.json(progressData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress data" });
    }
  });

  // Workout summary for AI coach page
  app.get("/api/workouts/summary", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const summary = await storage.getWorkoutSummary(userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout summary" });
    }
  });

  // User profile update
  app.patch("/api/user/profile", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password
  app.post("/api/user/change-password", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { currentPassword, newPassword } = req.body;
      const success = await storage.changePassword(userId, currentPassword, newPassword);
      
      if (success) {
        res.json({ message: "Password updated successfully" });
      } else {
        res.status(400).json({ message: "Current password is incorrect" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
