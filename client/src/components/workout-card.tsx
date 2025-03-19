import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface WorkoutCardProps {
  firstName?: string;
  lastWorkoutDate?: string;
  onStartWorkout: () => void;
}

export function WorkoutCard({ firstName, lastWorkoutDate, onStartWorkout }: WorkoutCardProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const handleStartWorkout = () => {
    navigate("/workout?new=true");
    onStartWorkout();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Welcome back, {firstName || user?.firstName || user?.username || "Fitness Enthusiast"}!
      </h1>
      <p className="text-gray-600">
        Your last workout was <span className="font-medium text-gray-800">{lastWorkoutDate || "a while ago"}</span>. Ready for another session?
      </p>
      <div className="mt-4">
        <Button 
          onClick={handleStartWorkout}
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Start New Workout
        </Button>
      </div>
    </div>
  );
}
