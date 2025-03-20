import { Sidebar } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { MobileNavigation } from "@/components/mobile-navigation";
import { AiCoach } from "@/components/ai-coach";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeminiProvider } from "@/hooks/use-gemini";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AiCoachPage() {
  const { t } = useTranslation();
  const { data: workoutSummary, isLoading } = useQuery({
    queryKey: ["/api/workouts/summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/workouts/summary");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <Sidebar />
      <MobileHeader />

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">{t('coach.title')}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <GeminiProvider>
                <AiCoach />
              </GeminiProvider>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('workout.completedWorkouts')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">{t('home.stats.workouts')}</p>
                        <p className="text-2xl font-semibold">{workoutSummary?.totalWorkouts || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('profile.stats')}</p>
                        <p className="text-lg font-medium">{workoutSummary?.mostTrainedMuscle || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('home.lastWorkout')}</p>
                        <p className="text-lg font-medium">
                          {workoutSummary?.lastWorkout 
                            ? new Date(workoutSummary.lastWorkout.date).toLocaleDateString() 
                            : t('home.noDate')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('workout.title')}</p>
                        <p className="text-lg font-medium">{workoutSummary?.weeklyAverage || 0} {t('home.stats.workouts').toLowerCase()}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('coach.examples.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm">{t('coach.examples.example1')}</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm">{t('coach.examples.example2')}</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm">{t('coach.examples.example3')}</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm">{t('coach.examples.example4')}</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
