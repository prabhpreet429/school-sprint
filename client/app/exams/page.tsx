"use client";

import { useGetExamsQuery, useCreateExamMutation, useUpdateExamMutation, useDeleteExamMutation, useGetClassesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { PlusCircleIcon, SearchIcon, Edit, Trash2 } from "lucide-react";
import CreateExamModal from "./CreateExamModal";
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

const Exams = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const { data, error, isLoading, isFetching } = useGetExamsQuery({ 
    schoolId, 
    search: searchTerm || undefined,
    classId: selectedClassId,
  });
  const [createExam] = useCreateExamMutation();
  const [updateExam] = useUpdateExamMutation();
  const [deleteExam] = useDeleteExamMutation();
  const [editingExam, setEditingExam] = useState<any>(null);

  const handleCreateExam = async (examData: any) => {
    try {
      await createExam(examData).unwrap();
      setIsModalOpen(false);
      setEditingExam(null);
    } catch (error) {
      console.error("Failed to create exam:", error);
    }
  };

  const handleUpdateExam = async (id: number, examData: any) => {
    try {
      await updateExam({ id, data: examData }).unwrap();
      setIsModalOpen(false);
      setEditingExam(null);
    } catch (error) {
      console.error("Error updating exam:", error);
    }
  };

  const handleEditExam = (exam: any) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const handleDeleteExam = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExam(id).unwrap();
      } catch (error) {
        console.error("Error deleting exam:", error);
        alert("Failed to delete exam");
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
      <div className="p-4">
        <div className="text-center text-red-500 py-4">
          Error loading exams. Please try again.
        </div>
      </div>
    );
  }

  const exams = data?.data || [];

  return (
    <div className="p-4">
      {/* Search Bar and Class Filter */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search exams..."
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
        <Header name="Exams" />
        <button
          onClick={() => {
            setEditingExam(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          <PlusCircleIcon size={20} />
          Create Exam
        </button>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Start Time</TableHead>
              <TableHead className="whitespace-nowrap">End Time</TableHead>
              <TableHead className="whitespace-nowrap">Subject</TableHead>
              <TableHead className="whitespace-nowrap">Class</TableHead>
              <TableHead className="whitespace-nowrap">Lesson</TableHead>
              <TableHead className="whitespace-nowrap">Results</TableHead>
              <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No exams found
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam: any) => (
                <TableRow key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell className="whitespace-nowrap font-medium">{exam.title}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(exam.startTime), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(exam.endTime), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {exam.lesson?.subject?.name || "N/A"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {exam.lesson?.class?.name || "N/A"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {exam.lesson?.name || "N/A"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {exam._count?.results || 0}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditExam(exam)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
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

      {/* MODAL */}
      <CreateExamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExam(null);
        }}
        onCreate={handleCreateExam}
        onUpdate={handleUpdateExam}
        initialData={editingExam}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Exams;

