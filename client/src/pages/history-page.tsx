import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { MobileNavigation } from "@/components/mobile-navigation";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Workout } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronRight, Filter } from "lucide-react";
import { useLocation } from "wouter";
import { ProgressChart } from "@/components/progress-chart";

export default function HistoryPage() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<string>("all"); // all, week, month, year

  const { data: workoutHistory, isLoading } = useQuery({
    queryKey: ["/api/workouts/history", filter],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/workouts/history?period=${filter}`);
      return res.json();
    },
  });

  const { data: progressData } = useQuery({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/progress");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <Sidebar />
      <MobileHeader />

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Workout History</h1>

            <div className="flex w-full md:w-auto space-x-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Workout Details</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Workout</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workoutHistory && workoutHistory.length > 0 ? (
                          workoutHistory.map((workout: Workout) => (
                            <TableRow key={workout.id}>
                              <TableCell className="font-medium">{workout.name}</TableCell>
                              <TableCell>{new Date(workout.date).toLocaleDateString()}</TableCell>
                              <TableCell>{workout.duration || "-"} min</TableCell>
                              <TableCell className="capitalize">{workout.type}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    workout.completed
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {workout.completed ? "Completed" : "In Progress"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/history/${workout.id}`)}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <p className="text-gray-500 mb-2">No workout history found</p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate("/workout?new=true")}
                              >
                                Create a workout
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart data={progressData || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
