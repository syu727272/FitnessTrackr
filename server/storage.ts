import { 
  users, type User, type InsertUser,
  exercises, type Exercise, type InsertExercise,
  workouts, type Workout, type InsertWorkout,
  workoutExercises, type WorkoutExercise, type InsertWorkoutExercise,
  exerciseSets, type ExerciseSet, type InsertExerciseSet,
  aiConversations, type AiConversation, type InsertAiConversation
} from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";
import session from "express-session";
import { WorkoutStats } from "@shared/schema";
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isAfter } from "date-fns";

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  changePassword(id: number, currentPassword: string, newPassword: string): Promise<boolean>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;

  // Exercise management
  getAllExercises(): Promise<Exercise[]>;
  getExerciseById(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // Workout management
  getWorkoutsByUserId(userId: number): Promise<Workout[]>;
  getWorkoutById(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout>;
  deleteWorkout(id: number): Promise<boolean>;
  getWorkoutHistory(userId: number, period: string): Promise<Workout[]>;
  getRecentWorkouts(userId: number, limit: number): Promise<Workout[]>;
  getWorkoutSummary(userId: number): Promise<{
    totalWorkouts: number;
    mostTrainedMuscle: string;
    lastWorkout: Workout | null;
    weeklyAverage: number;
  }>;

  // WorkoutExercise management
  getWorkoutExercisesByWorkoutId(workoutId: number): Promise<WorkoutExercise[]>;
  createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  deleteWorkoutExercise(id: number): Promise<boolean>;

  // ExerciseSet management
  getExerciseSetsByWorkoutExerciseId(workoutExerciseId: number): Promise<ExerciseSet[]>;
  createExerciseSet(exerciseSet: InsertExerciseSet): Promise<ExerciseSet>;
  updateExerciseSet(id: number, exerciseSet: Partial<InsertExerciseSet>): Promise<ExerciseSet>;
  deleteExerciseSetsByWorkoutExerciseId(workoutExerciseId: number): Promise<boolean>;

  // AI conversations
  getUserConversation(userId: number): Promise<AiConversation | undefined>;
  saveUserConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  resetUserConversation(userId: number): Promise<boolean>;

  // Stats and dashboard data
  getUserStats(userId: number): Promise<WorkoutStats>;
  getProgressData(userId: number): Promise<any[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private exercises: Map<number, Exercise>;
  private workouts: Map<number, Workout>;
  private workoutExercises: Map<number, WorkoutExercise>;
  private exerciseSets: Map<number, ExerciseSet>;
  private aiConversations: Map<number, AiConversation>;
  sessionStore: session.SessionStore;

  private userIdCounter: number;
  private exerciseIdCounter: number;
  private workoutIdCounter: number;
  private workoutExerciseIdCounter: number;
  private exerciseSetIdCounter: number;
  private aiConversationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.exercises = new Map();
    this.workouts = new Map();
    this.workoutExercises = new Map();
    this.exerciseSets = new Map();
    this.aiConversations = new Map();

    this.userIdCounter = 1;
    this.exerciseIdCounter = 1;
    this.workoutIdCounter = 1;
    this.workoutExerciseIdCounter = 1;
    this.exerciseSetIdCounter = 1;
    this.aiConversationIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // One day cleanup
    });

    // Initialize with some sample exercises
    this.initExercises();
  }

  // Hash and verify functions
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const [hashed, salt] = hashedPassword.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(plainPassword, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const hashedPassword = await this.hashPassword(userData.password);
    const user: User = { ...userData, id, password: hashedPassword };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    // Don't allow password to be updated through this method
    const { password, ...updateData } = userData;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValid = await this.verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return false;
    }

    // Update password
    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    this.users.set(id, user);
    return true;
  }

  // Exercise management
  async getAllExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(exerciseData: InsertExercise): Promise<Exercise> {
    const id = this.exerciseIdCounter++;
    const exercise: Exercise = { ...exerciseData, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  // Workout management
  async getWorkoutsByUserId(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter((workout) => workout.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getWorkoutById(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(workoutData: InsertWorkout): Promise<Workout> {
    const id = this.workoutIdCounter++;
    const workout: Workout = { ...workoutData, id };
    this.workouts.set(id, workout);
    return workout;
  }

  async updateWorkout(id: number, workoutData: Partial<InsertWorkout>): Promise<Workout> {
    const workout = await this.getWorkoutById(id);
    if (!workout) {
      throw new Error("Workout not found");
    }

    const updatedWorkout = { ...workout, ...workoutData };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: number): Promise<boolean> {
    return this.workouts.delete(id);
  }

  async getWorkoutHistory(userId: number, period: string): Promise<Workout[]> {
    const workouts = await this.getWorkoutsByUserId(userId);
    const now = new Date();
    
    // Filter workouts based on period
    if (period === 'week') {
      const startOfWeekDate = startOfWeek(now);
      return workouts.filter(workout => 
        isAfter(new Date(workout.date), startOfWeekDate)
      );
    } else if (period === 'month') {
      const startOfMonthDate = startOfMonth(now);
      return workouts.filter(workout => 
        isAfter(new Date(workout.date), startOfMonthDate)
      );
    } else if (period === 'year') {
      const startOfYearDate = startOfYear(now);
      return workouts.filter(workout => 
        isAfter(new Date(workout.date), startOfYearDate)
      );
    }
    
    // Default: return all
    return workouts;
  }

  async getRecentWorkouts(userId: number, limit: number): Promise<Workout[]> {
    const workouts = await this.getWorkoutsByUserId(userId);
    return workouts.slice(0, limit);
  }

  async getWorkoutSummary(userId: number): Promise<{
    totalWorkouts: number;
    mostTrainedMuscle: string;
    lastWorkout: Workout | null;
    weeklyAverage: number;
  }> {
    const workouts = await this.getWorkoutsByUserId(userId);
    const totalWorkouts = workouts.length;
    const lastWorkout = workouts.length > 0 ? workouts[0] : null;
    
    // Calculate weekly average
    const fourWeeksAgo = subDays(new Date(), 28);
    const recentWorkouts = workouts.filter(workout => 
      isAfter(new Date(workout.date), fourWeeksAgo)
    );
    const weeklyAverage = Math.round((recentWorkouts.length / 4) * 10) / 10;
    
    // Get most trained muscle group
    const muscleGroups: Record<string, number> = {};
    for (const workout of workouts) {
      const workoutExercises = await this.getWorkoutExercisesByWorkoutId(workout.id);
      for (const workoutExercise of workoutExercises) {
        const exercise = await this.getExerciseById(workoutExercise.exerciseId);
        if (exercise && exercise.muscleGroup) {
          muscleGroups[exercise.muscleGroup] = (muscleGroups[exercise.muscleGroup] || 0) + 1;
        }
      }
    }
    
    let mostTrainedMuscle = "None";
    let maxCount = 0;
    for (const [muscle, count] of Object.entries(muscleGroups)) {
      if (count > maxCount) {
        maxCount = count;
        mostTrainedMuscle = muscle;
      }
    }
    
    return {
      totalWorkouts,
      mostTrainedMuscle,
      lastWorkout,
      weeklyAverage
    };
  }
  
  // WorkoutExercise management
  async getWorkoutExercisesByWorkoutId(workoutId: number): Promise<WorkoutExercise[]> {
    return Array.from(this.workoutExercises.values())
      .filter((we) => we.workoutId === workoutId)
      .sort((a, b) => a.order - b.order);
  }

  async createWorkoutExercise(workoutExerciseData: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const id = this.workoutExerciseIdCounter++;
    const workoutExercise: WorkoutExercise = { ...workoutExerciseData, id };
    this.workoutExercises.set(id, workoutExercise);
    return workoutExercise;
  }

  async deleteWorkoutExercise(id: number): Promise<boolean> {
    return this.workoutExercises.delete(id);
  }

  // ExerciseSet management
  async getExerciseSetsByWorkoutExerciseId(workoutExerciseId: number): Promise<ExerciseSet[]> {
    return Array.from(this.exerciseSets.values())
      .filter((set) => set.workoutExerciseId === workoutExerciseId)
      .sort((a, b) => a.setNumber - b.setNumber);
  }

  async createExerciseSet(exerciseSetData: InsertExerciseSet): Promise<ExerciseSet> {
    const id = this.exerciseSetIdCounter++;
    const exerciseSet: ExerciseSet = { ...exerciseSetData, id };
    this.exerciseSets.set(id, exerciseSet);
    return exerciseSet;
  }

  async updateExerciseSet(id: number, exerciseSetData: Partial<InsertExerciseSet>): Promise<ExerciseSet> {
    const exerciseSet = this.exerciseSets.get(id);
    if (!exerciseSet) {
      throw new Error("Exercise set not found");
    }

    const updatedExerciseSet = { ...exerciseSet, ...exerciseSetData };
    this.exerciseSets.set(id, updatedExerciseSet);
    return updatedExerciseSet;
  }

  async deleteExerciseSetsByWorkoutExerciseId(workoutExerciseId: number): Promise<boolean> {
    let success = true;
    const sets = await this.getExerciseSetsByWorkoutExerciseId(workoutExerciseId);
    
    for (const set of sets) {
      if (!this.exerciseSets.delete(set.id)) {
        success = false;
      }
    }
    
    return success;
  }

  // AI conversations
  async getUserConversation(userId: number): Promise<AiConversation | undefined> {
    return Array.from(this.aiConversations.values()).find(
      (conversation) => conversation.userId === userId
    );
  }

  async saveUserConversation(conversationData: InsertAiConversation): Promise<AiConversation> {
    // Check if conversation already exists
    const existingConversation = await this.getUserConversation(conversationData.userId);
    
    if (existingConversation) {
      // Update existing conversation
      const updatedConversation = { 
        ...existingConversation, 
        messages: conversationData.messages,
        timestamp: new Date()
      };
      this.aiConversations.set(existingConversation.id, updatedConversation);
      return updatedConversation;
    } else {
      // Create new conversation
      const id = this.aiConversationIdCounter++;
      const timestamp = new Date();
      const conversation: AiConversation = { ...conversationData, id, timestamp };
      this.aiConversations.set(id, conversation);
      return conversation;
    }
  }

  async resetUserConversation(userId: number): Promise<boolean> {
    const conversation = await this.getUserConversation(userId);
    if (!conversation) {
      return false;
    }
    
    // Create a new conversation with empty messages
    const newConversation: AiConversation = {
      ...conversation,
      messages: [],
      timestamp: new Date()
    };
    
    this.aiConversations.set(conversation.id, newConversation);
    return true;
  }

  // Stats and dashboard data
  async getUserStats(userId: number): Promise<WorkoutStats> {
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);
    
    const workouts = await this.getWorkoutsByUserId(userId);
    
    // Workouts this week
    const workoutsThisWeek = workouts.filter(workout => 
      isAfter(new Date(workout.date), oneWeekAgo)
    ).length;
    
    // Calculate personal records
    let personalRecords = 0;
    const exerciseMaxes: Record<number, { weight: number, date: Date }> = {};
    
    for (const workout of workouts) {
      const workoutExercises = await this.getWorkoutExercisesByWorkoutId(workout.id);
      for (const workoutExercise of workoutExercises) {
        const sets = await this.getExerciseSetsByWorkoutExerciseId(workoutExercise.id);
        for (const set of sets) {
          if (set.weight && workoutExercise.exerciseId) {
            if (!exerciseMaxes[workoutExercise.exerciseId] || 
                set.weight > exerciseMaxes[workoutExercise.exerciseId].weight) {
              // If new PR and date is after the previous record, increment PR count
              if (exerciseMaxes[workoutExercise.exerciseId] && 
                  isAfter(new Date(workout.date), exerciseMaxes[workoutExercise.exerciseId].date)) {
                personalRecords++;
              }
              
              exerciseMaxes[workoutExercise.exerciseId] = { 
                weight: set.weight, 
                date: new Date(workout.date) 
              };
            }
          }
        }
      }
    }
    
    // Active days (unique workout days)
    const uniqueDates = new Set(workouts.map(workout => 
      format(new Date(workout.date), 'yyyy-MM-dd')
    ));
    const activeDays = uniqueDates.size;
    
    // Calculate total weight lifted
    let totalWeight = 0;
    for (const workout of workouts) {
      const workoutExercises = await this.getWorkoutExercisesByWorkoutId(workout.id);
      for (const workoutExercise of workoutExercises) {
        const sets = await this.getExerciseSetsByWorkoutExerciseId(workoutExercise.id);
        for (const set of sets) {
          if (set.weight && set.reps) {
            totalWeight += set.weight * set.reps;
          }
        }
      }
    }
    
    // Format total weight (e.g., 4.8k)
    let totalWeightFormatted = totalWeight.toString();
    if (totalWeight >= 1000) {
      totalWeightFormatted = (Math.round(totalWeight / 100) / 10) + 'k';
    }
    
    return {
      workoutsThisWeek,
      personalRecords,
      activeDays,
      totalWeight: totalWeightFormatted
    };
  }

  async getProgressData(userId: number): Promise<any[]> {
    const workouts = await this.getWorkoutsByUserId(userId);
    const progressData = [];
    
    // Take only the most recent 10 workouts for the chart
    const recentWorkouts = workouts.slice(0, 10).reverse();
    
    for (const workout of recentWorkouts) {
      let totalWeight = 0;
      let totalReps = 0;
      let totalVolume = 0;
      
      const workoutExercises = await this.getWorkoutExercisesByWorkoutId(workout.id);
      for (const workoutExercise of workoutExercises) {
        const sets = await this.getExerciseSetsByWorkoutExerciseId(workoutExercise.id);
        for (const set of sets) {
          if (set.weight && set.reps) {
            totalWeight += set.weight;
            totalReps += set.reps;
            totalVolume += set.weight * set.reps;
          }
        }
      }
      
      progressData.push({
        date: format(new Date(workout.date), 'MMM d'),
        weight: totalWeight,
        reps: totalReps,
        volume: totalVolume
      });
    }
    
    return progressData;
  }

  // Initialize with some sample exercises
  private async initExercises() {
    const exerciseData: InsertExercise[] = [
      {
        name: "Bench Press",
        type: "strength",
        equipment: "Barbell",
        muscleGroup: "Chest",
        description: "Lie on a flat bench, grip the barbell with hands slightly wider than shoulder-width, lower the bar to your chest, then push it back up."
      },
      {
        name: "Squat",
        type: "strength",
        equipment: "Barbell",
        muscleGroup: "Legs",
        description: "Stand with feet shoulder-width apart, barbell on your upper back, bend knees to lower your body, then return to standing position."
      },
      {
        name: "Deadlift",
        type: "strength",
        equipment: "Barbell",
        muscleGroup: "Back",
        description: "Stand with feet hip-width apart, bend to grip the barbell, keeping back straight, lift the bar by extending hips and knees."
      },
      {
        name: "Pull-Ups",
        type: "strength",
        equipment: "Bodyweight",
        muscleGroup: "Back",
        description: "Hang from a bar with palms facing away, pull your body up until chin is over the bar, then lower back down with control."
      },
      {
        name: "Push-Ups",
        type: "strength",
        equipment: "Bodyweight",
        muscleGroup: "Chest",
        description: "Start in plank position with hands slightly wider than shoulders, lower your body until chest nearly touches the floor, then push back up."
      },
      {
        name: "Shoulder Press",
        type: "strength",
        equipment: "Dumbbell",
        muscleGroup: "Shoulders",
        description: "Sit or stand with dumbbells at shoulder height, palms facing forward, press weights overhead, then lower them back down."
      },
      {
        name: "Bicep Curls",
        type: "strength",
        equipment: "Dumbbell",
        muscleGroup: "Arms",
        description: "Stand with dumbbells at your sides, palms facing forward, curl the weights toward your shoulders, then lower back down."
      },
      {
        name: "Tricep Dips",
        type: "strength",
        equipment: "Bodyweight",
        muscleGroup: "Arms",
        description: "Grip parallel bars with straight arms, lower your body by bending your elbows, then push back up."
      },
      {
        name: "Leg Press",
        type: "strength",
        equipment: "Machine",
        muscleGroup: "Legs",
        description: "Sit in the leg press machine, press the platform away by extending your knees, then return to starting position."
      },
      {
        name: "Plank",
        type: "strength",
        equipment: "Bodyweight",
        muscleGroup: "Core",
        description: "Hold a position similar to a push-up but with weight on forearms, keeping body in a straight line from head to heels."
      },
      {
        name: "Lat Pulldown",
        type: "strength",
        equipment: "Machine",
        muscleGroup: "Back",
        description: "Sit at a lat pulldown machine, grip the bar with hands wider than shoulders, pull the bar down to your chest, then slowly release."
      },
      {
        name: "Lunges",
        type: "strength",
        equipment: "Bodyweight",
        muscleGroup: "Legs",
        description: "Stand with feet together, step forward with one foot and lower your body until both knees are bent at 90 degrees, then return to starting position."
      }
    ];

    for (const exercise of exerciseData) {
      await this.createExercise(exercise);
    }
  }
}

export const storage = new MemStorage();
