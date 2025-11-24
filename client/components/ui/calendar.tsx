"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CalendarProps {
  events?: Array<{
    id: number;
    startTime: string;
    endTime: string;
    title: string;
    description?: string;
    class?: {
      id: number;
      name: string;
    } | null;
  }>;
  holidays?: Array<{
    date: string;
    name: string;
  }>;
  className?: string;
}

export function Calendar({ events = [], holidays = [], className }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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

  // Check if a date has holidays
  const hasHolidays = (date: Date) => {
    return holidays.some((holiday) => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(holidayDate, date);
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, date);
    });
  };

  // Get holidays for a specific date
  const getHolidaysForDate = (date: Date) => {
    return holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(holidayDate, date);
    });
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const handleDateClick = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const dayHolidays = getHolidaysForDate(date);
    
    // Only open dialog if there are events or holidays
    if (dayEvents.length > 0 || dayHolidays.length > 0) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
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
          const dayHasHoliday = hasHolidays(day);
          const dayIsToday = isToday(day);
          const dayEvents = getEventsForDate(day);
          const dayHolidays = getHolidaysForDate(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={cn(
                "aspect-square p-1 rounded-lg border border-transparent hover:border-primary/50 transition-all duration-200 cursor-pointer",
                dayIsToday && "bg-gradient-to-br from-primary/20 to-primary/10 border-primary shadow-sm",
                dayHasHoliday && !dayHasEvents && "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-200 dark:border-amber-700",
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
                {dayHasHoliday && (
                  <div className="flex gap-1 mt-1.5 justify-center">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm"
                      title={dayHolidays.map(h => h.name).join(", ")}
                    />
                  </div>
                )}
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

      {/* Dialog for showing events and holidays */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription>
              Events and holidays for this date
            </DialogDescription>
          </DialogHeader>
          
          {selectedDate && (
            <div className="space-y-4 mt-4">
              {/* Holidays */}
              {getHolidaysForDate(selectedDate).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600" />
                    Holidays
                  </h3>
                  <div className="space-y-2">
                    {getHolidaysForDate(selectedDate).map((holiday, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {holiday.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {getEventsForDate(selectedDate).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                    Events
                  </h3>
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50"
                      >
                        <p className="text-sm font-medium text-foreground mb-1">
                          {event.title}
                        </p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(event.startTime), "h:mm a")}
                          </span>
                          {event.endTime && (
                            <>
                              <span>•</span>
                              <span>
                                {format(new Date(event.endTime), "h:mm a")}
                              </span>
                            </>
                          )}
                        </div>
                        {event.class?.name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Class: {event.class.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No events or holidays message */}
              {getEventsForDate(selectedDate).length === 0 && 
               getHolidaysForDate(selectedDate).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events or holidays for this date
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

