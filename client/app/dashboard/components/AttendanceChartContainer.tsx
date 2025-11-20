"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetDashboardDataQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const AttendanceChartContainer = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  
  if (!schoolIdParam) {
    return (
      <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 overflow-hidden">
        <CardHeader className="border-b border-emerald-200/50 dark:border-emerald-700/50 pb-3">
          <CardTitle className="text-base sm:text-lg font-bold">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center p-3 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Access Denied</p>
        </CardContent>
      </Card>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);
  const { data, isLoading } = useGetDashboardDataQuery(isNaN(schoolId) ? 0 : schoolId);

  if (isLoading) {
    return (
      <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 overflow-hidden">
        <CardHeader className="border-b border-emerald-200/50 dark:border-emerald-700/50 pb-3">
          <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
        </CardHeader>
        <CardContent className="h-full p-3 sm:p-6">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const dashboardData = data?.data;

  if (!dashboardData || !dashboardData.attendance?.monthlyAverages) {
    return (
      <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 overflow-hidden">
        <CardHeader className="border-b border-emerald-200/50 dark:border-emerald-700/50 pb-3">
          <CardTitle className="text-base sm:text-lg font-bold">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center p-3 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const monthlyData = dashboardData.attendance.monthlyAverages || [];
  
  // Calculate max value for scaling
  const maxValue = Math.max(
    ...monthlyData.flatMap((d) => [d.present, d.absent]),
    1
  );

  return (
    <Card className="w-full h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-3">
        <CardTitle className="text-base sm:text-lg font-bold">Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent className="h-full p-3 sm:p-6 overflow-hidden">
        <div className="h-full flex flex-col min-h-0">
          {/* Legend */}
          <div className="flex gap-3 sm:gap-6 mb-3 sm:mb-6 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Present</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-sm flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Absent</span>
            </div>
          </div>

          {/* Chart Area - Scrollable on mobile */}
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden pb-2">
            <div className="flex items-end gap-2 sm:gap-4 h-full min-w-fit px-1" style={{ minHeight: "200px", height: "100%" }}>
              {monthlyData.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-1 sm:gap-2 group flex-shrink-0" style={{ width: "60px", height: "100%" }}>
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full relative">
                    {/* Present bar (green) - left */}
                    <div 
                      className="w-6 sm:w-8 flex flex-col items-center justify-end relative flex-shrink-0"
                      style={{ height: "100%" }}
                    >
                      <div
                        className="w-full rounded-t transition-all duration-700 ease-out shadow-md hover:shadow-lg bg-gradient-to-t from-emerald-500 to-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-700"
                        style={{
                          height: `${maxValue > 0 ? (item.present / maxValue) * 100 : 0}%`,
                          minHeight: item.present > 0 ? "2px" : "0",
                        }}
                        title={`Present: ${item.present}`}
                      />
                      {item.present > 0 && (
                        <span className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {item.present}
                        </span>
                      )}
                    </div>
                    
                    {/* Absent bar (red) - right */}
                    <div 
                      className="w-6 sm:w-8 flex flex-col items-center justify-end relative flex-shrink-0"
                      style={{ height: "100%" }}
                    >
                      <div
                        className="w-full rounded-t transition-all duration-700 ease-out shadow-md hover:shadow-lg bg-gradient-to-t from-red-500 to-red-600 group-hover:from-red-600 group-hover:to-red-700"
                        style={{
                          height: `${maxValue > 0 ? (item.absent / maxValue) * 100 : 0}%`,
                          minHeight: item.absent > 0 ? "2px" : "0",
                        }}
                        title={`Absent: ${item.absent}`}
                      />
                      {item.absent > 0 && (
                        <span className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                          {item.absent}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Month label */}
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2 text-center leading-tight px-0.5">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceChartContainer;
