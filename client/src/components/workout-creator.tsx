import { useState, useEffect } from "react";
import { Exercise, ExerciseSet, InsertWorkout } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ExerciseItem } from "./exercise-item";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface WorkoutCreatorProps {
  workoutId?: number;
}

export function WorkoutCreator({ workoutId }: WorkoutCreatorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedExercises, setSelectedExercises] = useState<
    Array<{ exercise: Exercise; sets: ExerciseSet[] }>
  >([]);
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertWorkout>>({
    name: "",
    notes: "",
    type: "strength",
    date: new Date().toISOString().split("T")[0],
    completed: false,
    duration: 0,
  });

  // Load workout data if editing
  const { data: workoutData, isLoading: isLoadingWorkout } = useQuery({
    queryKey: ["/api/workouts", workoutId],
    queryFn: async () => {
      if (!workoutId) return null;
      const res = await apiRequest("GET", `/api/workouts/${workoutId}`);
      return res.json();
    },
    enabled: !!workoutId,
  });

  // Load exercises
  const { data: exercises = [], isLoading: isLoadingExercises } = useQuery({
    queryKey: ["/api/exercises"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/exercises");
      return res.json();
    },
  });

  // Save workout
  const saveWorkoutMutation = useMutation({
    mutationFn: async (data: {
      workout: Partial<InsertWorkout>;
      exercises: Array<{ exercise: Exercise; sets: ExerciseSet[] }>;
    }) => {
      if (workoutId) {
        // Update existing workout
        const res = await apiRequest(
          "PUT",
          `/api/workouts/${workoutId}`,
          data
        );
        return res.json();
      } else {
        // Create new workout
        const res = await apiRequest("POST", "/api/workouts", data);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: workoutId ? "Workout Updated" : "Workout Created",
        description: workoutId
          ? "Your workout has been updated successfully."
          : "Your new workout has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to save workout: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add exercise to workout
  const addExercise = (exercise: Exercise) => {
    const initialSet: ExerciseSet = {
      id: 0,
      workoutExerciseId: 0,
      reps: null,
      weight: null,
      duration: null,
      distance: null,
      completed: false,
      setNumber: 1,
    };
    
    setSelectedExercises((prev) => [
      ...prev,
      { exercise, sets: [initialSet] },
    ]);
    setExerciseDialogOpen(false);
  };

  // Remove exercise from workout
  const removeExercise = (index: number) => {
    setSelectedExercises((prev) => {
      const newExercises = [...prev];
      newExercises.splice(index, 1);
      return newExercises;
    });
  };

  // Update exercise sets
  const updateExerciseSets = (index: number, sets: ExerciseSet[]) => {
    setSelectedExercises((prev) => {
      const newExercises = [...prev];
      newExercises[index] = { ...newExercises[index], sets };
      return newExercises;
    });
  };

  // Save workout
  const handleSaveWorkout = () => {
    if (!formData.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for your workout.",
        variant: "destructive",
      });
      return;
    }

    if (selectedExercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "Please add at least one exercise to your workout.",
        variant: "destructive",
      });
      return;
    }

    const workout: Partial<InsertWorkout> = {
      ...formData,
      userId: user?.id,
    };

    saveWorkoutMutation.mutate({
      workout,
      exercises: selectedExercises,
    });
  };

  // Load workout data if editing
  useEffect(() => {
    if (workoutData) {
      setFormData({
        name: workoutData.workout.name,
        notes: workoutData.workout.notes,
        type: workoutData.workout.type,
        date: new Date(workoutData.workout.date).toISOString().split("T")[0],
        completed: workoutData.workout.completed,
        duration: workoutData.workout.duration,
      });

      setSelectedExercises(workoutData.exercises);
    }
  }, [workoutData]);

  // Show loading state
  if (isLoadingWorkout) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {workoutId ? "Edit Workout" : "New Workout Session"}
          </CardTitle>
          <Button variant="ghost" className="text-sm font-medium text-primary hover:text-indigo-700">
            Save as Template
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-4">
            <div className="sm:w-1/3 mb-3 sm:mb-0">
              <Label htmlFor="workout-name" className="block text-sm font-medium text-gray-700 mb-1">
                Workout Name
              </Label>
              <Input
                id="workout-name"
                name="name"
                placeholder="e.g. Upper Body Power"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:w-1/3 sm:px-4 mb-3 sm:mb-0">
              <Label htmlFor="workout-date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </Label>
              <Input
                type="date"
                id="workout-date"
                name="date"
                value={formData.date || ""}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:w-1/3">
              <Label htmlFor="workout-type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </Label>
              <Select
                value={formData.type || "strength"}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger id="workout-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="workout-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </Label>
            <Textarea
              id="workout-notes"
              name="notes"
              rows={2}
              placeholder="Optional notes about this workout..."
              value={formData.notes || ""}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-800 mb-4">Exercises</h4>

          {/* Exercise List */}
          <div className="space-y-4">
            {selectedExercises.map((item, index) => (
              <ExerciseItem
                key={item.exercise.id + "-" + index}
                exercise={item.exercise}
                sets={item.sets}
                onSetsChange={(sets) => updateExerciseSets(index, sets)}
                onRemove={() => removeExercise(index)}
              />
            ))}
          </div>

          {/* Add Exercise Button */}
          <div className="mt-4">
            <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-400 focus:outline-none"
                >
                  + Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Exercise</DialogTitle>
                </DialogHeader>
                {isLoadingExercises ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <ScrollArea className="h-72 pr-4">
                    <div className="space-y-2">
                      {exercises.map((exercise: Exercise) => (
                        <div
                          key={exercise.id}
                          className="p-3 border border-gray-100 rounded-md hover:bg-gray-50 cursor-pointer"
                          onClick={() => addExercise(exercise)}
                        >
                          <h5 className="font-medium text-gray-800">{exercise.name}</h5>
                          <p className="text-xs text-gray-500">
                            {exercise.equipment} • {exercise.muscleGroup}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none"
            onClick={handleSaveWorkout}
            disabled={saveWorkoutMutation.isPending}
          >
            {saveWorkoutMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Workout"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
