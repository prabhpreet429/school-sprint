"use client";

import { useGetStudentByIdQuery } from "@/state/api";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, GraduationCap, Users, Edit, Award, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StudentView = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentIdParam = params?.id as string;
  const schoolIdParam = searchParams?.get("schoolId");

  if (!studentIdParam || !schoolIdParam) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  const studentId = parseInt(studentIdParam, 10);
  const schoolId = parseInt(schoolIdParam, 10);

  if (isNaN(studentId) || isNaN(schoolId)) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  const { data, error, isLoading, isFetching } = useGetStudentByIdQuery({
    id: studentId,
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
          Student not found
        </p>
      </div>
    );
  }

  const student = data.data;

  // Format birthday
  const formatDateLocal = (date: Date | string): string => {
    if (!date) return "N/A";
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = dateOnly.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return format(d, "MMMM dd, yyyy");
  };

  const birthdayFormatted = formatDateLocal(student.birthday);

  // Group parents by relationship
  const parentsByRelationship = {
    FATHER: student.studentParents?.find(sp => sp.relationship === "FATHER")?.parent,
    MOTHER: student.studentParents?.find(sp => sp.relationship === "MOTHER")?.parent,
    GUARDIAN: student.studentParents?.filter(sp => sp.relationship === "GUARDIAN").map(sp => sp.parent) || [],
  };

  return (
    <div className="p-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/students?schoolId=${schoolId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Link>
      </div>

      {/* Student Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Student Image */}
            <div className="flex-shrink-0">
              {student.img ? (
                <img
                  src={student.img}
                  alt={`${student.name} ${student.surname}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-4xl font-medium border-4 border-gray-200 dark:border-gray-700">
                  {student.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {student.name} {student.surname}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">@{student.username}</p>
                </div>
                <button
                  onClick={() => router.push(`/students?schoolId=${schoolId}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Edit Student
                </button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.email && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span>{student.email}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{student.address}</span>
                  </div>
                )}
                {student.birthday && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>{birthdayFormatted}</span>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  {student.sex === "MALE" ? "Male" : "Female"}
                </div>
                {student.class && (
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                    Class: {student.class.name}
                  </div>
                )}
                {student.grade && (
                  <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                    Grade: {student.grade.level}
                  </div>
                )}
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
                <ClipboardCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {student._count?.attendances || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Results</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {student._count?.results || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Parents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {student._count?.studentParents || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class & Grade Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Class & Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student.class ? (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {student.class.name}
                  </p>
                  {student.class.grade && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Grade {student.class.grade.level}
                    </p>
                  )}
                  {student.class._count && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {student.class._count.students} students in class
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No class assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Parents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Parents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student.studentParents && student.studentParents.length > 0 ? (
              <div className="space-y-4">
                {parentsByRelationship.FATHER && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Father</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {parentsByRelationship.FATHER.name} {parentsByRelationship.FATHER.surname}
                    </p>
                    {parentsByRelationship.FATHER.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{parentsByRelationship.FATHER.email}</p>
                    )}
                    {parentsByRelationship.FATHER.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{parentsByRelationship.FATHER.phone}</p>
                    )}
                  </div>
                )}
                {parentsByRelationship.MOTHER && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Mother</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {parentsByRelationship.MOTHER.name} {parentsByRelationship.MOTHER.surname}
                    </p>
                    {parentsByRelationship.MOTHER.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{parentsByRelationship.MOTHER.email}</p>
                    )}
                    {parentsByRelationship.MOTHER.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{parentsByRelationship.MOTHER.phone}</p>
                    )}
                  </div>
                )}
                {parentsByRelationship.GUARDIAN.length > 0 && (
                  <div className="space-y-2">
                    {parentsByRelationship.GUARDIAN.map((guardian, index) => (
                      <div key={guardian.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Guardian {index + 1}</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {guardian.name} {guardian.surname}
                        </p>
                        {guardian.email && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{guardian.email}</p>
                        )}
                        {guardian.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{guardian.phone}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No parents assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance */}
      {student.attendances && student.attendances.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.attendances.map((attendance) => (
                    <TableRow key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <TableCell>
                        {format(new Date(attendance.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          attendance.present
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {attendance.present ? "Present" : "Absent"}
                        </span>
                      </TableCell>
                      <TableCell>{attendance.lesson?.name || "N/A"}</TableCell>
                      <TableCell>{attendance.lesson?.subject?.name || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Results */}
      {student.results && student.results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    <TableHead>Score</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.results.map((result) => (
                    <TableRow key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <TableCell className="font-medium">{result.score}</TableCell>
                      <TableCell>
                        {result.exam ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
                            Exam
                          </span>
                        ) : result.assignment ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs">
                            Assignment
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {result.exam?.title || result.assignment?.title || "N/A"}
                      </TableCell>
                      <TableCell>
                        {result.exam?.lesson?.subject?.name || result.assignment?.lesson?.subject?.name || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentView;

