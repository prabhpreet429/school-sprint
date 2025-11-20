"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetDashboardDataQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

const EventsList = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");

  if (!schoolIdParam) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 h-full flex flex-col">
        <CardHeader className="border-b border-purple-200/50 dark:border-purple-700/50">
          <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex-1">
          <p className="text-sm text-muted-foreground">Access Denied</p>
        </CardContent>
      </Card>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);
  const { data, isLoading } = useGetDashboardDataQuery(isNaN(schoolId) ? 0 : schoolId);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 h-full flex flex-col">
        <CardHeader className="border-b border-purple-200/50 dark:border-purple-700/50">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-6 flex-1">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const dashboardData = data?.data;

  if (!dashboardData) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 h-full flex flex-col">
        <CardHeader className="border-b border-purple-200/50 dark:border-purple-700/50">
          <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex-1">
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const events = dashboardData.upcomingEvents || [];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 h-full flex flex-col">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((event) => {
              const startDate = new Date(event.startTime);
              const endDate = event.endTime ? new Date(event.endTime) : null;
              const isToday = format(startDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const isTomorrow = format(startDate, "yyyy-MM-dd") === format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

              return (
                <div
                  key={event.id}
                  className="p-4 bg-gradient-to-r from-purple-100/80 to-indigo-100/80 dark:from-purple-800/30 dark:to-indigo-800/30 rounded-xl border border-purple-200/50 dark:border-purple-700/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1.5 text-foreground truncate">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mb-2 leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {isToday
                              ? "Today"
                              : isTomorrow
                              ? "Tomorrow"
                              : format(startDate, "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {format(startDate, "h:mm a")}
                            {endDate && ` - ${format(endDate, "h:mm a")}`}
                          </span>
                        </div>
                        {event.className && (
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">
                            Class: {event.className}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventsList;


