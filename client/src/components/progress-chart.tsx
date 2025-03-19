import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type ChartType = "weight" | "reps" | "volume";

interface DataPoint {
  date: string;
  weight?: number;
  reps?: number;
  volume?: number;
}

interface ProgressChartProps {
  data: DataPoint[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  const [chartType, setChartType] = useState<ChartType>("weight");

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded border border-gray-200">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                No progress data available yet. Complete workouts to see your progress.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-sm"
              onClick={() => setChartType("weight")}
              disabled={chartType === "weight"}
            >
              Weight
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-sm"
              onClick={() => setChartType("reps")}
              disabled={chartType === "reps"}
            >
              Reps
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-sm"
              onClick={() => setChartType("volume")}
              disabled={chartType === "volume"}
            >
              Volume
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={30} />
              <Tooltip />
              <Bar
                dataKey={chartType}
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            variant={chartType === "weight" ? "default" : "outline"}
            className="flex-1 text-sm"
            onClick={() => setChartType("weight")}
          >
            Weight
          </Button>
          <Button
            variant={chartType === "reps" ? "default" : "outline"}
            className="flex-1 text-sm"
            onClick={() => setChartType("reps")}
          >
            Reps
          </Button>
          <Button
            variant={chartType === "volume" ? "default" : "outline"}
            className="flex-1 text-sm"
            onClick={() => setChartType("volume")}
          >
            Volume
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
