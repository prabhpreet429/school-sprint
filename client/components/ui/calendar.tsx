"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  events?: Array<{
    id: number;
    startTime: string;
    endTime: string;
    title: string;
  }>;
  className?: string;
}

export function Calendar({ events = [], className }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month to determine starting position
  const firstDayOfWeek = getDay(monthStart);
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a date has events
  const hasEvents = (date: Date) => {
    return events.some((event) => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, date);
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, date);
    });
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={previousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="h-7 px-2 text-xs"
          >
            Today
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before month starts */}
        {daysBeforeMonth.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {daysInMonth.map((day) => {
          const dayHasEvents = hasEvents(day);
          const dayIsToday = isToday(day);
          const dayEvents = getEventsForDate(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square p-1 rounded-lg border border-transparent hover:border-primary/50 transition-all duration-200 cursor-pointer",
                dayIsToday && "bg-gradient-to-br from-primary/20 to-primary/10 border-primary shadow-sm",
                dayHasEvents && "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium h-full flex flex-col items-center justify-center",
                  !isSameMonth(day, currentDate) && "text-muted-foreground opacity-50",
                  dayIsToday && "text-primary font-bold"
                )}
              >
                {format(day, "d")}
                {dayHasEvents && (
                  <div className="flex gap-1 mt-1.5 justify-center">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-60" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

