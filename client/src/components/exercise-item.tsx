import { useState } from "react";
import { Exercise, ExerciseSet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExerciseItemProps {
  exercise: Exercise;
  sets: ExerciseSet[];
  onSetsChange: (sets: ExerciseSet[]) => void;
  onRemove: () => void;
}

export function ExerciseItem({ exercise, sets, onSetsChange, onRemove }: ExerciseItemProps) {
  const addSet = () => {
    const newSet: ExerciseSet = {
      id: 0, // Will be set by the server
      workoutExerciseId: 0, // Will be set by the server
      reps: null,
      weight: null,
      duration: null,
      distance: null,
      completed: false,
      setNumber: sets.length + 1,
    };
    onSetsChange([...sets, newSet]);
  };

  const updateSet = (index: number, field: keyof ExerciseSet, value: any) => {
    const updatedSets = [...sets];
    updatedSets[index] = { ...updatedSets[index], [field]: value };
    onSetsChange(updatedSets);
  };

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h5 className="text-md font-medium text-gray-800">{exercise.name}</h5>
          <p className="text-xs text-gray-500">
            {exercise.equipment} • {exercise.muscleGroup}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Exercise</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {exercise.name} from your workout? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove} className="bg-red-500 hover:bg-red-600">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-2">
        {sets.map((set, index) => (
          <div key={index} className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              {index === 0 && (
                <label className="block text-xs font-medium text-gray-500">Set</label>
              )}
              <div className="py-2 px-3 text-sm font-medium text-gray-700">{set.setNumber}</div>
            </div>
            <div className="col-span-1">
              {index === 0 && (
                <label className="block text-xs font-medium text-gray-500">Weight (kg)</label>
              )}
              <Input
                type="number"
                placeholder="0"
                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={set.weight || ""}
                onChange={(e) => updateSet(index, "weight", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="col-span-1">
              {index === 0 && (
                <label className="block text-xs font-medium text-gray-500">Reps</label>
              )}
              <Input
                type="number"
                placeholder="0"
                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={set.reps || ""}
                onChange={(e) => updateSet(index, "reps", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="col-span-1">
              {index === 0 && (
                <label className="block text-xs font-medium text-gray-500">Complete</label>
              )}
              <div className="py-1.5 flex items-center justify-center">
                <Checkbox
                  checked={set.completed}
                  onCheckedChange={(checked) => updateSet(index, "completed", !!checked)}
                  className="h-5 w-5 text-primary focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="ghost"
          onClick={addSet}
          className="w-full text-center text-sm text-primary hover:text-indigo-700 font-medium py-1"
        >
          + Add Set
        </Button>
      </div>
    </div>
  );
}
