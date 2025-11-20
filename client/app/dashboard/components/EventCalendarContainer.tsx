"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useGetDashboardDataQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface EventCalendarContainerProps {
  searchParams?: { [keys: string]: string | undefined };
}

const EventCalendarContainer = ({ searchParams }: EventCalendarContainerProps) => {
  const urlSearchParams = useSearchParams();
  const schoolIdParam = urlSearchParams?.get("schoolId");
  
  if (!schoolIdParam) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20">
        <CardHeader className="border-b border-amber-200/50 dark:border-amber-700/50">
          <CardTitle className="text-lg font-bold">Calendar</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Access Denied</p>
        </CardContent>
      </Card>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);
  const { data, isLoading } = useGetDashboardDataQuery(isNaN(schoolId) ? 0 : schoolId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const dashboardData = data?.data;

  if (!dashboardData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 h-full flex flex-col">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-bold">Calendar</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1 overflow-hidden">
        <Calendar 
          events={dashboardData.upcomingEvents} 
          holidays={dashboardData.holidays || []}
        />
      </CardContent>
    </Card>
  );
};

export default EventCalendarContainer;

