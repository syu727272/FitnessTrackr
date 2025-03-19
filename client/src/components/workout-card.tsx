import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

interface WorkoutCardProps {
  firstName?: string;
  lastWorkoutDate?: string;
  onStartWorkout: () => void;
}

export function WorkoutCard({ firstName, lastWorkoutDate, onStartWorkout }: WorkoutCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const handleStartWorkout = () => {
    navigate("/workout?new=true");
    onStartWorkout();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        {t("home.welcome", { name: firstName || user?.firstName || user?.username || t("home.defaultName") })}
      </h1>
      <p className="text-gray-600">
        {t("home.lastWorkout")} <span className="font-medium text-gray-800">{lastWorkoutDate || t("home.noDate")}</span>. {t("home.readyPrompt")}
      </p>
      <div className="mt-4">
        <Button 
          onClick={handleStartWorkout}
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          {t("workout.startNew")}
        </Button>
      </div>
    </div>
  );
}
