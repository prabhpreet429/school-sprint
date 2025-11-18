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
      <Card className="w-full h-[450px] border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-bold">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Access Denied</p>
        </CardContent>
      </Card>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);
  const { data, isLoading } = useGetDashboardDataQuery(isNaN(schoolId) ? 0 : schoolId);

  if (isLoading) {
    return (
      <Card className="w-full h-[450px] border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="h-full p-6">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const dashboardData = data?.data;

  if (!dashboardData || !dashboardData.attendance?.monthlyAverages) {
    return (
      <Card className="w-full h-[450px] border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-bold">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">No data available</p>
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
    <Card className="w-full h-[450px] border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-bold">Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent className="h-full p-6">
        <div className="h-full flex flex-col">
          {/* Legend */}
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm" />
              <span className="text-sm font-medium text-foreground">Present</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-sm" />
              <span className="text-sm font-medium text-foreground">Absent</span>
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1 flex items-end gap-4 pb-4" style={{ height: "280px" }}>
            {monthlyData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group" style={{ height: "100%" }}>
                <div className="w-full flex items-end justify-center gap-2 h-full relative">
                  {/* Present bar (green) - left */}
                  <div 
                    className="w-8 flex flex-col items-center justify-end relative"
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
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {item.present}
                      </span>
                    )}
                  </div>
                  
                  {/* Absent bar (red) - right */}
                  <div 
                    className="w-8 flex flex-col items-center justify-end relative"
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
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                        {item.absent}
                      </span>
                    )}
                  </div>
                </div>
                {/* Month label */}
                <span className="text-xs font-medium text-muted-foreground mt-2 text-center">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceChartContainer;
