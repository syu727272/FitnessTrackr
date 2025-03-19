import { cn } from "@/lib/utils";
import { WorkoutStats } from "@shared/schema";
import { Clock, Zap, Calendar, Scale } from "lucide-react";

interface StatsGridProps {
  stats: WorkoutStats;
  className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  const items = [
    {
      title: "Workouts",
      value: stats.workoutsThisWeek.toString(),
      icon: Clock,
      color: "bg-indigo-100 text-primary",
    },
    {
      title: "PRs Set",
      value: stats.personalRecords.toString(),
      icon: Zap,
      color: "bg-emerald-100 text-secondary",
    },
    {
      title: "Active Days",
      value: stats.activeDays.toString(),
      icon: Calendar,
      color: "bg-amber-100 text-amber-500",
    },
    {
      title: "Total Lifted",
      value: stats.totalWeight,
      icon: Scale,
      color: "bg-blue-100 text-blue-500",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", className)}>
      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center">
            <div className={cn("flex items-center justify-center w-12 h-12 rounded-lg", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
              <p className="text-2xl font-semibold text-gray-800">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
