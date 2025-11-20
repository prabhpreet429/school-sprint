"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetClassesQuery, useGetStudentsQuery, useGetLessonsQuery, useGetAttendancesQuery, useCreateAttendanceMutation, useUpdateAttendanceMutation } from "@/state/api";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { format } from "date-fns";
import Header from "@/app/(components)/Header";

const MarkAttendancePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const schoolIdParam = searchParams?.get("schoolId");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [studentAttendance, setStudentAttendance] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!schoolIdParam) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);

  if (isNaN(schoolId)) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  // Set default date to today
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    }
  }, []);

  const { data: classesData } = useGetClassesQuery({ schoolId, search: "" });
  const { data: studentsData } = useGetStudentsQuery({ schoolId, search: "" });
  const { data: lessonsData } = useGetLessonsQuery({ schoolId, search: "" });
  const { data: attendancesData } = useGetAttendancesQuery({ 
    schoolId, 
    search: "" 
  }, {
    skip: !selectedDate || !selectedClassId, // Skip if date or class not selected
  });
  const [createAttendance] = useCreateAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();

  const classes = classesData?.data || [];
  const allStudents = studentsData?.data || [];
  const lessons = lessonsData?.data || [];
  const existingAttendances = attendancesData?.data || [];

  // Helper function to get day of week from date string (YYYY-MM-DD)
  const getDayOfWeek = (dateString: string): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    const dayMap: Record<number, string> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };
    
    return dayMap[day] || null;
  };

  // Filter students by selected class (memoized to prevent infinite loops)
  const classStudents = useMemo(() => {
    return selectedClassId
      ? allStudents.filter((student: any) => student.classId === selectedClassId)
      : [];
  }, [selectedClassId, allStudents]);

  // Filter lessons by selected class and day of week (memoized to prevent infinite loops)
  const dayOfWeek = selectedDate ? getDayOfWeek(selectedDate) : null;
  const classLessonsForDay = useMemo(() => {
    return selectedClassId && dayOfWeek
      ? lessons.filter((lesson: any) => 
          lesson.classId === selectedClassId && lesson.day === dayOfWeek
        )
      : [];
  }, [selectedClassId, dayOfWeek, lessons]);

  // Create a map of existing attendance records: key = `${studentId}-${lessonId}`, value = attendance record
  // Only include attendances for students in the selected class and lessons for the selected day
  const attendanceMap = useMemo(() => {
    const map = new Map<string, any>();
    if (selectedDate && selectedClassId && classStudents.length > 0 && classLessonsForDay.length > 0) {
      const classStudentIds = new Set(classStudents.map((s: any) => s.id));
      const classLessonIds = new Set(classLessonsForDay.map((l: any) => l.id));
      
      existingAttendances.forEach((attendance: any) => {
        // Only process attendances for students in the selected class and lessons for the selected day
        if (!classStudentIds.has(attendance.studentId) || !classLessonIds.has(attendance.lessonId)) {
          return;
        }
        
        // Parse the date string from attendance (format: YYYY-MM-DD or ISO string)
        // Extract just the date part to avoid timezone issues
        let attendanceDateStr: string;
        if (typeof attendance.date === 'string') {
          // If it's an ISO string, extract just the date part (YYYY-MM-DD)
          attendanceDateStr = attendance.date.split('T')[0];
        } else {
          // If it's a Date object, format it as YYYY-MM-DD
          const d = new Date(attendance.date);
          attendanceDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        
        // Compare date strings directly (YYYY-MM-DD format)
        if (attendanceDateStr === selectedDate) {
          const key = `${attendance.studentId}-${attendance.lessonId}`;
          map.set(key, attendance);
        }
      });
    }
    return map;
  }, [selectedDate, selectedClassId, existingAttendances, classStudents, classLessonsForDay]);

  // Create a stable key for tracking when to update attendance
  const attendanceUpdateKey = useMemo(() => {
    if (!selectedClassId || !selectedDate || classStudents.length === 0 || classLessonsForDay.length === 0) {
      return null;
    }
    const studentIds = classStudents.map((s: any) => s.id).sort().join(',');
    const lessonIds = classLessonsForDay.map((l: any) => l.id).sort().join(',');
    const attendanceKeys = Array.from(attendanceMap.keys()).sort().join(',');
    return `${selectedClassId}-${selectedDate}-${studentIds}-${lessonIds}-${attendanceKeys}`;
  }, [selectedClassId, selectedDate, classStudents, classLessonsForDay, attendanceMap]);

  // Initialize student attendance when class or date changes
  // If existing attendance records exist, use them; otherwise default to present
  useEffect(() => {
    if (!attendanceUpdateKey) {
      setStudentAttendance({});
      return;
    }

    if (selectedClassId && classStudents.length > 0 && classLessonsForDay.length > 0) {
      const initialAttendance: Record<number, boolean> = {};
      classStudents.forEach((student: any) => {
        // Check if there's an existing attendance for any lesson on this day
        // If multiple lessons exist, use the first one's status as default
        const firstLesson = classLessonsForDay[0];
        const key = `${student.id}-${firstLesson.id}`;
        const existingAttendance = attendanceMap.get(key);
        
        if (existingAttendance) {
          // Use existing attendance status
          initialAttendance[student.id] = existingAttendance.present;
        } else {
          // Default to present if no existing record
          initialAttendance[student.id] = true;
        }
      });
      setStudentAttendance(initialAttendance);
    } else {
      setStudentAttendance({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceUpdateKey]);

  const handleToggleAttendance = (studentId: number) => {
    setStudentAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSelectAll = (present: boolean) => {
    const newAttendance: Record<number, boolean> = {};
    classStudents.forEach((student: any) => {
      newAttendance[student.id] = present;
    });
    setStudentAttendance(newAttendance);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedDate) {
      newErrors.date = "Date is required";
    }
    if (!selectedClassId) {
      newErrors.classId = "Class is required";
    }
    if (classStudents.length === 0 && selectedClassId) {
      newErrors.students = "No students found in this class";
    }
    if (selectedClassId && selectedDate && classLessonsForDay.length === 0) {
      newErrors.lessons = "No lessons found for this class on the selected day";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create or update attendance records for all students for all lessons on that day
      const attendancePromises: Promise<any>[] = [];
      
      // Debug: Log the attendance map
      console.log('Attendance Map:', Array.from(attendanceMap.entries()));
      console.log('Selected Date:', selectedDate);
      
      classStudents.forEach((student: any) => {
        classLessonsForDay.forEach((lesson: any) => {
          const key = `${student.id}-${lesson.id}`;
          const existingAttendance = attendanceMap.get(key);
          const isPresent = studentAttendance[student.id] ?? true;

          console.log(`Checking key: ${key}, Found:`, existingAttendance);

          if (existingAttendance && existingAttendance.id) {
            // Update existing attendance
            console.log(`Updating attendance ${existingAttendance.id} for student ${student.id}, lesson ${lesson.id}`);
            attendancePromises.push(
              updateAttendance({
                id: existingAttendance.id,
                data: {
                  date: selectedDate,
                  present: isPresent,
                  studentId: student.id,
                  lessonId: lesson.id,
                },
              }).unwrap()
            );
          } else {
            // Create new attendance
            console.log(`Creating new attendance for student ${student.id}, lesson ${lesson.id}`);
            attendancePromises.push(
              createAttendance({
                date: selectedDate,
                present: isPresent,
                schoolId,
                studentId: student.id,
                lessonId: lesson.id,
              }).unwrap()
            );
          }
        });
      });

      await Promise.all(attendancePromises);
      
      // Navigate back to attendances page
      router.push(`/attendances?schoolId=${schoolId}`);
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      alert("Failed to mark attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClass = classes.find((c: any) => c.id === selectedClassId);

  return (
    <div className="p-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/attendances?schoolId=${schoolId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Attendances
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <Header name="Mark Attendance" />
      </div>

      {/* Form Container */}
      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
                {selectedDate && dayOfWeek && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}
                    {classLessonsForDay.length > 0 && ` - ${classLessonsForDay.length} lesson${classLessonsForDay.length !== 1 ? 's' : ''} scheduled`}
                  </p>
                )}
              </div>

              {/* Class Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedClassId ? String(selectedClassId) : ""}
                  onValueChange={(value) => {
                    setSelectedClassId(value ? parseInt(value, 10) : null);
                  }}
                >
                  <SelectTrigger className={errors.classId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem: any) => (
                      <SelectItem key={classItem.id} value={String(classItem.id)}>
                        {classItem.name} {classItem.grade ? `(Grade ${classItem.grade.level})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classId && (
                  <p className="text-red-500 text-xs mt-1">{errors.classId}</p>
                )}
                {errors.lessons && (
                  <p className="text-red-500 text-xs mt-1">{errors.lessons}</p>
                )}
              </div>
            </div>

            {/* Lessons Info */}
            {selectedClassId && selectedDate && classLessonsForDay.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Lessons on {dayOfWeek ? dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase() : 'this day'}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {classLessonsForDay.map((lesson: any) => (
                    <span
                      key={lesson.id}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {lesson.name} ({lesson.subject?.name}) - {format(new Date(lesson.startTime), "h:mm a")} - {format(new Date(lesson.endTime), "h:mm a")}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Attendance will be marked for all {classLessonsForDay.length} lesson{classLessonsForDay.length !== 1 ? 's' : ''} above.
                </p>
              </div>
            )}

            {/* Student List */}
            {selectedClassId && classStudents.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Students in {selectedClass?.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(true)}
                      className="cursor-pointer"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark All Present
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(false)}
                      className="cursor-pointer"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Mark All Absent
                    </Button>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {classStudents.map((student: any) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {student.img ? (
                            <img
                              src={student.img}
                              alt={`${student.name} ${student.surname}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-300 font-medium">
                                {student.name.charAt(0)}{student.surname.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {student.name} {student.surname}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {student.username}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(student.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                            studentAttendance[student.id]
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                          }`}
                        >
                          {studentAttendance[student.id] ? (
                            <>
                              <Check className="w-4 h-4" />
                              Present
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Absent
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    Present:{" "}
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {Object.values(studentAttendance).filter((v) => v).length}
                    </span>{" "}
                    / Absent:{" "}
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {Object.values(studentAttendance).filter((v) => !v).length}
                    </span>{" "}
                    / Total:{" "}
                    <span className="font-semibold">
                      {classStudents.length}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {selectedClassId && classStudents.length === 0 && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  No students found in this class.
                </p>
              </div>
            )}

            {!selectedClassId && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">
                  Please select a class to view students.
                </p>
              </div>
            )}

            {/* Submit Button */}
            {selectedClassId && classStudents.length > 0 && (
              <div className="mt-6 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/attendances?schoolId=${schoolId}`)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Mark Attendance"}
                </Button>
              </div>
            )}
          </form>
      </div>
    </div>
  );
};

export default MarkAttendancePage;

