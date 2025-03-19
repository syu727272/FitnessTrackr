import { ChevronRight } from "lucide-react";
import { Workout } from "@shared/schema";
import { useLocation } from "wouter";
import { formatDistance } from "date-fns";

interface RecentWorkoutsProps {
  workouts: Workout[];
}

export function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  const [, navigate] = useLocation();

  const getTimeAgo = (date: Date) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };

  const getDuration = (duration: number | null | undefined) => {
    if (!duration) return "";
    return `• ${duration} min`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Recent Workouts</h3>
      </div>
      <div className="px-6 py-4 custom-scrollbar max-h-80 overflow-y-auto">
        {workouts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No workouts recorded yet.</p>
            <button
              onClick={() => navigate("/workout?new=true")}
              className="mt-2 text-sm font-medium text-primary hover:text-indigo-700"
            >
              Start your first workout
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {workouts.map((workout) => (
              <li key={workout.id} className="py-3 flex justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">{workout.name}</h4>
                  <p className="text-sm text-gray-500">
                    {getTimeAgo(workout.date)} {getDuration(workout.duration)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {workout.completed ? "Completed" : "In Progress"}
                  </span>
                  <button
                    className="ml-2 text-gray-400 hover:text-gray-500"
                    onClick={() => navigate(`/history/${workout.id}`)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => navigate("/history")}
          className="text-sm font-medium text-primary hover:text-indigo-700"
        >
          View all workouts →
        </button>
      </div>
    </div>
  );
}
