import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { MobileNavigation } from "@/components/mobile-navigation";
import { WorkoutCard } from "@/components/workout-card";
import { StatsGrid } from "@/components/stats-grid";
import { RecentWorkouts } from "@/components/recent-workouts";
import { ProgressChart } from "@/components/progress-chart";
import { AiCoach } from "@/components/ai-coach";
import { formatDistance } from "date-fns";
import { Loader2 } from "lucide-react";
import { WorkoutStats } from "@shared/schema";
import { GeminiProvider } from "@/hooks/use-gemini";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard");
      return res.json();
    },
  });

  const lastWorkoutDate = dashboardData?.lastWorkout
    ? formatDistance(new Date(dashboardData.lastWorkout.date), new Date(), { addSuffix: true })
    : "never";

  const defaultStats: WorkoutStats = {
    workoutsThisWeek: 0,
    personalRecords: 0,
    activeDays: 0,
    totalWeight: "0",
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <Sidebar />
      <MobileHeader />

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-[80vh]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Dashboard */}
              <section id="dashboard" className="mb-12">
                <WorkoutCard
                  firstName={dashboardData?.user?.firstName}
                  lastWorkoutDate={lastWorkoutDate}
                  onStartWorkout={() => {
                    // This function is handled inside the component now
                  }}
                />

                {/* Stats Overview */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Fitness Overview</h2>
                <StatsGrid stats={dashboardData?.stats || defaultStats} />

                {/* Recent Workouts & Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RecentWorkouts workouts={dashboardData?.recentWorkouts || []} />
                  <ProgressChart data={dashboardData?.progressData || []} />
                </div>
              </section>

              {/* AI Coach Section */}
              <section id="ai-coach" className="mb-12">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Coach</h2>
                <GeminiProvider>
                  <AiCoach />
                </GeminiProvider>
              </section>
            </>
          )}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
