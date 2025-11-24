"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Lesson {
  id: number;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  subject?: {
    id: number;
    name: string;
  };
  class?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    name: string;
    surname: string;
  };
}

interface StudentScheduleCalendarProps {
  lessons: Lesson[];
}

const StudentScheduleCalendar = ({ lessons }: StudentScheduleCalendarProps) => {
  // Define days of the week (Monday to Friday based on schema)
  const daysOfWeek = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ];

  const dayLabels: { [key: string]: string } = {
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
  };

  // Generate time slots from 7:00 AM to 6:00 PM (hourly intervals)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 7; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const startHour = 7;
  const endHour = 18;
  const totalHours = endHour - startHour + 1; // 12 hours (7 AM to 6 PM)

  // Get lessons for a specific day
  const getLessonsForDay = (day: string) => {
    return lessons.filter((lesson) => lesson.day === day);
  };

  // Extract time from DateTime string and convert to minutes from start of day
  const getTimeInMinutes = (dateTimeString: string): number => {
    try {
      const date = new Date(dateTimeString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return hours * 60 + minutes;
    } catch (error) {
      console.error("Error parsing time:", dateTimeString, error);
      return 0;
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, "h:mm a");
    } catch {
      return timeString;
    }
  };

  // Calculate position and width for a lesson block
  const getLessonPosition = (startTime: string, endTime: string) => {
    const startMinutes = getTimeInMinutes(startTime);
    const endMinutes = getTimeInMinutes(endTime);

    // Convert to hours (decimal)
    const startHourDecimal = startMinutes / 60;
    const endHourDecimal = endMinutes / 60;

    // Clamp to visible range (7 AM - 6 PM)
    const visibleStart = Math.max(startHour, startHourDecimal);
    const visibleEnd = Math.min(endHour + 1, endHourDecimal);

    // Calculate position relative to 7 AM
    const leftPercent = ((visibleStart - startHour) / totalHours) * 100;
    const widthPercent = ((visibleEnd - visibleStart) / totalHours) * 100;

    return {
      left: `${Math.max(0, Math.min(100, leftPercent))}%`,
      width: `${Math.max(0, Math.min(100 - leftPercent, widthPercent))}%`,
    };
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No lessons scheduled
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="relative">
                {/* Time header row */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  {/* Day label column */}
                  <div className="w-32 flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Day / Time
                  </div>
                  {/* Time slots as columns */}
                  <div className="flex flex-1">
                    {timeSlots.map((time, index) => {
                      const [hour] = time.split(":");
                      const hourNum = parseInt(hour);
                      return (
                        <div
                          key={time}
                          className="flex-1 p-2 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 last:border-r-0"
                        >
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {hourNum > 12
                              ? `${hourNum - 12} PM`
                              : hourNum === 12
                              ? `12 PM`
                              : `${hourNum} AM`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Days as rows */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  {daysOfWeek.map((day) => {
                    const dayLessons = getLessonsForDay(day);
                    return (
                      <div
                        key={day}
                        className="flex border-b border-gray-200 dark:border-gray-700 last:border-b-0 relative"
                        style={{ minHeight: "80px" }}
                      >
                        {/* Day label */}
                        <div className="w-32 flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex items-center">
                          <div>
                            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                              {dayLabels[day]}
                            </div>
                            {dayLessons.length > 0 && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {dayLessons.length} lesson{dayLessons.length !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Time slots grid */}
                        <div className="flex-1 relative">
                          {/* Hour lines */}
                          {timeSlots.map((_, index) => (
                            <div
                              key={`line-${index}`}
                              className="absolute top-0 bottom-0 border-r border-gray-200 dark:border-gray-700"
                              style={{
                                left: `${(index / timeSlots.length) * 100}%`,
                              }}
                            />
                          ))}

                          {/* Lesson blocks */}
                          {dayLessons.map((lesson) => {
                            const position = getLessonPosition(
                              lesson.startTime,
                              lesson.endTime
                            );

                            return (
                              <div
                                key={lesson.id}
                                className="absolute top-1 bottom-1 rounded-md p-2 bg-blue-500 text-white text-xs shadow-sm hover:bg-blue-600 transition-colors cursor-pointer z-10 overflow-hidden"
                                style={{
                                  left: position.left,
                                  width: position.width,
                                  minWidth: "60px",
                                }}
                                title={`${lesson.name} - ${lesson.subject?.name || "N/A"}\n${lesson.teacher ? `${lesson.teacher.name} ${lesson.teacher.surname}` : "N/A"}\n${formatTime(lesson.startTime)} - ${formatTime(lesson.endTime)}`}
                              >
                                <div className="font-semibold truncate text-[11px] leading-tight">
                                  {lesson.name}
                                </div>
                                <div className="text-blue-100 text-[10px] truncate mt-0.5">
                                  {lesson.subject?.name || "N/A"}
                                </div>
                                {lesson.teacher && (
                                  <div className="text-blue-100 text-[10px] truncate">
                                    {lesson.teacher.name} {lesson.teacher.surname}
                                  </div>
                                )}
                                <div className="text-blue-100 text-[9px] mt-1 font-medium">
                                  {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentScheduleCalendar;




