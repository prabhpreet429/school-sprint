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
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
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
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-bold">Calendar</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Calendar events={dashboardData.upcomingEvents} />
      </CardContent>
    </Card>
  );
};

export default EventCalendarContainer;

