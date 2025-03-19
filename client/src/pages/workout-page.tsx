import { useEffect, useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { MobileNavigation } from "@/components/mobile-navigation";
import { WorkoutCreator } from "@/components/workout-creator";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Workout } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function WorkoutPage() {
  const [location] = useLocation();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);

  const { data: workouts, isLoading } = useQuery({
    queryKey: ["/api/workouts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/workouts");
      return res.json();
    },
  });

  // Check if we should show the workout creator immediately
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('new') === 'true') {
      setIsCreatingWorkout(true);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <Sidebar />
      <MobileHeader />

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Workouts</h1>
              {!isCreatingWorkout && (
                <Button onClick={() => setIsCreatingWorkout(true)}>
                  Create New Workout
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isCreatingWorkout ? (
              <WorkoutCreator workoutId={selectedWorkoutId || undefined} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Your Workouts</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {workouts && workouts.length > 0 ? (
                    workouts.map((workout: Workout) => (
                      <div key={workout.id} className="p-6 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800">{workout.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(workout.date).toLocaleDateString()} • {workout.type}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSelectedWorkoutId(workout.id);
                              setIsCreatingWorkout(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button>Continue</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-gray-500 mb-4">You haven't created any workouts yet.</p>
                      <Button onClick={() => setIsCreatingWorkout(true)}>
                        Create Your First Workout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
