"use client";

import { useGetAttendancesQuery, useDeleteAttendanceMutation, useGetClassesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckSquare, SearchIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Attendances = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const schoolIdParam = searchParams?.get("schoolId");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);

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

  // Fetch classes for dropdown
  const { data: classesData } = useGetClassesQuery({ schoolId });
  const classes = classesData?.data || [];

  // Auto-select class based on user role
  useEffect(() => {
    if (user && !selectedClassId) {
      if (user.role === "student" && user.classId) {
        setSelectedClassId(user.classId);
      } else if (user.role === "teacher" && user.classIds && user.classIds.length > 0) {
        setSelectedClassId(user.classIds[0]);
      }
    }
  }, [user, selectedClassId]);

  const { data, error, isLoading, isFetching } = useGetAttendancesQuery({ 
    schoolId, 
    search: searchTerm || undefined,
    classId: selectedClassId,
  });
  const [deleteAttendance] = useDeleteAttendanceMutation();

  const handleDeleteAttendance = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await deleteAttendance(id).unwrap();
      } catch (error) {
        console.error("Error deleting attendance:", error);
        alert("Failed to delete attendance");
      }
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Failed to fetch attendances
        </p>
      </div>
    );
  }

  const attendances = data?.data || [];

  // Helper function to format date without timezone issues
  const formatDateLocal = (dateString: string | Date): string => {
    if (!dateString) return "N/A";
    let date: Date;
    if (typeof dateString === 'string') {
      // Extract date part (YYYY-MM-DD) and create date in local timezone
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = dateString;
    }
    return format(date, "MMM dd, yyyy");
  };

  return (
    <div className="p-4">
      {/* Search Bar and Class Filter */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search attendances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
        <div className="w-64">
          <Select
            value={selectedClassId?.toString() || "all"}
            onValueChange={(value) => setSelectedClassId(value === "all" ? undefined : parseInt(value, 10))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Header name="Attendances" />
        <button
          onClick={() => {
            router.push(`/attendances/mark?schoolId=${schoolId}`);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          <CheckSquare size={20} />
          Mark Attendance
        </button>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead>Date</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Lesson</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No attendances found
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((attendance: any) => (
                <TableRow key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell className="font-medium">
                    {formatDateLocal(attendance.date)}
                  </TableCell>
                  <TableCell>
                    {attendance.student ? `${attendance.student.name} ${attendance.student.surname}` : "N/A"}
                  </TableCell>
                  <TableCell>
                    {attendance.student?.class?.name || attendance.lesson?.class?.name || "N/A"}
                  </TableCell>
                  <TableCell>{attendance.lesson?.name || "N/A"}</TableCell>
                  <TableCell>{attendance.lesson?.subject?.name || "N/A"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      attendance.present
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {attendance.present ? "Present" : "Absent"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDeleteAttendance(attendance.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Attendances;

