"use client";

import { useGetTeacherByIdQuery } from "@/state/api";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, GraduationCap, BookOpen, Layers, Edit } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import TeacherScheduleCalendar from "./TeacherScheduleCalendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TeacherView = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const teacherIdParam = params?.id as string;
  const schoolIdParam = searchParams?.get("schoolId");

  if (!teacherIdParam || !schoolIdParam) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  const teacherId = parseInt(teacherIdParam, 10);
  const schoolId = parseInt(schoolIdParam, 10);

  if (isNaN(teacherId) || isNaN(schoolId)) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  const { data, error, isLoading, isFetching } = useGetTeacherByIdQuery({
    id: teacherId,
    schoolId,
  });

  if (isLoading || isFetching) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Teacher not found
        </p>
      </div>
    );
  }

  const teacher = data.data;

  // Format birthday
  const formatDateLocal = (date: Date | string): string => {
    if (!date) return "N/A";
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = dateOnly.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return format(d, "MMMM dd, yyyy");
  };

  const birthdayFormatted = formatDateLocal(teacher.birthday);

  return (
    <div className="p-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/teachers?schoolId=${schoolId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teachers
        </Link>
      </div>

      {/* Teacher Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Teacher Image */}
            <div className="flex-shrink-0">
              {teacher.img ? (
                <img
                  src={teacher.img}
                  alt={`${teacher.name} ${teacher.surname}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-4xl font-medium border-4 border-gray-200 dark:border-gray-700">
                  {teacher.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Teacher Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {teacher.name} {teacher.surname}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">@{teacher.username}</p>
                </div>
                <button
                  onClick={() => router.push(`/teachers?schoolId=${schoolId}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Edit Teacher
                </button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacher.email && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span>{teacher.email}</span>
                  </div>
                )}
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {teacher.address && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{teacher.address}</span>
                  </div>
                )}
                {teacher.birthday && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>{birthdayFormatted}</span>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  {teacher.sex === "MALE" ? "Male" : "Female"}
                </div>
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                  Blood Type: {teacher.bloodType}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {teacher._count?.subjects || teacher.subjects?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Layers className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Classes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {teacher._count?.classes || teacher.classes?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lessons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {teacher._count?.lessons || teacher.lessons?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teacher.subjects && teacher.subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No subjects assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teacher.classes && teacher.classes.length > 0 ? (
              <div className="space-y-3">
                {teacher.classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {classItem.name}
                        </p>
                        {classItem.grade && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Grade {classItem.grade.level}
                          </p>
                        )}
                      </div>
                      {classItem._count && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {classItem._count.students} students
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No classes assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule Calendar */}
      {teacher.lessons && teacher.lessons.length > 0 && (
        <TeacherScheduleCalendar lessons={teacher.lessons} />
      )}

      {/* Lessons Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teacher.lessons && teacher.lessons.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    <TableHead>Name</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacher.lessons.map((lesson) => (
                    <TableRow
                      key={lesson.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <TableCell className="font-medium">
                        {lesson.name}
                      </TableCell>
                      <TableCell>{lesson.day}</TableCell>
                      <TableCell>
                        {format(new Date(lesson.startTime), "h:mm a")} - {format(new Date(lesson.endTime), "h:mm a")}
                      </TableCell>
                      <TableCell>{lesson.subject?.name || "N/A"}</TableCell>
                      <TableCell>{lesson.class?.name || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No lessons assigned to this teacher
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherView;

