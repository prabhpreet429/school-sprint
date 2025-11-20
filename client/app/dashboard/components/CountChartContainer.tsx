"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetDashboardDataQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const CountChartContainer = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  
  if (!schoolIdParam) {
    return (
      <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="border-b border-blue-200/50 dark:border-indigo-700/50 pb-3">
          <CardTitle className="text-lg font-bold">Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center p-4 overflow-hidden">
          <p className="text-sm text-muted-foreground">Access Denied</p>
        </CardContent>
      </Card>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);
  const { data, isLoading } = useGetDashboardDataQuery(isNaN(schoolId) ? 0 : schoolId);

  if (isLoading) {
    return (
      <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const dashboardData = data?.data;

  if (!dashboardData) {
    return (
      <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-bold">Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const boysCount = dashboardData.counts?.boys ?? 0;
  const girlsCount = dashboardData.counts?.girls ?? 0;
  const total = boysCount + girlsCount;

  // Calculate percentages
  const boysPercentage = total > 0 ? (boysCount / total) * 100 : 0;
  const girlsPercentage = total > 0 ? (girlsCount / total) * 100 : 0;

  // Show message if no data
  if (total === 0) {
    return (
      <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-bold">Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No student data available</p>
        </CardContent>
      </Card>
    );
  }

  // Donut chart configuration
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 18;
  const size = 160;
  const center = size / 2;
  
  // Calculate stroke dash for boys (starts from top)
  const boysDash = (boysPercentage / 100) * circumference;
  const boysGap = circumference - boysDash;
  
  // Girls starts after boys
  const girlsDash = (girlsPercentage / 100) * circumference;
  const girlsGap = circumference - girlsDash;
  const girlsOffset = -boysGap;

  return (
      <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-indigo-900/30 dark:to-purple-900/30 overflow-hidden">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-3">
        <CardTitle className="text-lg font-bold">Gender Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full flex flex-col items-center gap-4 max-w-full h-full">
          {/* Donut Chart */}
          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg 
              width={size} 
              height={size} 
              className="transform -rotate-90"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="boysGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="girlsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#db2777" />
                </linearGradient>
              </defs>
              
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
                className="opacity-20"
              />
              
              {/* Boys segment */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="url(#boysGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${boysDash} ${boysGap}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Girls segment */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="url(#girlsGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${girlsDash} ${girlsGap}`}
                strokeDashoffset={girlsOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total</p>
            </div>
          </div>

          {/* Legend with icons */}
          <div className="w-full space-y-2.5 max-w-full flex-1 flex flex-col justify-center">
            {/* Boys */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-100/60 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/50">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">Boys</p>
                  <p className="text-xs text-muted-foreground">{boysPercentage.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2">
                {boysCount.toLocaleString()}
              </p>
            </div>

            {/* Girls */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-pink-100/60 dark:bg-pink-900/30 border border-pink-200/60 dark:border-pink-800/50">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex-shrink-0">
                  <Users className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">Girls</p>
                  <p className="text-xs text-muted-foreground">{girlsPercentage.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-xl font-bold text-pink-600 dark:text-pink-400 flex-shrink-0 ml-2">
                {girlsCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountChartContainer;

