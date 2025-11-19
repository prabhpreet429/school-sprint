"use client";

import { useGetGradesQuery, useCreateGradeMutation, useUpdateGradeMutation, useDeleteGradeMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, Edit, Trash2 } from "lucide-react";
import CreateGradeModal from "./CreateGradeModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Grades = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
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

  const { data, error, isLoading, isFetching } = useGetGradesQuery({ schoolId });
  const [createGrade, { isLoading: isCreating }] = useCreateGradeMutation();
  const [updateGrade] = useUpdateGradeMutation();
  const [deleteGrade] = useDeleteGradeMutation();
  const [editingGrade, setEditingGrade] = useState<any>(null);

  const handleCreateGrade = async (gradeData: { level: number; schoolId: number }) => {
    try {
      await createGrade(gradeData).unwrap();
      setIsModalOpen(false);
      setEditingGrade(null);
    } catch (error) {
      console.error("Failed to create grade:", error);
    }
  };

  const handleUpdateGrade = async (id: number, gradeData: { level: number; schoolId: number }) => {
    try {
      await updateGrade({ id, data: gradeData }).unwrap();
      setIsModalOpen(false);
      setEditingGrade(null);
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };

  const handleEditGrade = (grade: any) => {
    setEditingGrade(grade);
    setIsModalOpen(true);
  };

  const handleDeleteGrade = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await deleteGrade(id).unwrap();
      } catch (error) {
        console.error("Error deleting grade:", error);
        alert("Failed to delete grade");
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
          Access Denied
        </p>
      </div>
    );
  }

  const grades = data?.data || [];

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <Header name="Grades" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          <PlusCircleIcon size={20} />
          Create Grade
        </button>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead>Grade Level</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No grades found
                </TableCell>
              </TableRow>
            ) : (
              grades.map((grade: any) => (
                <TableRow key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell>Grade {grade.level}</TableCell>
                  <TableCell>{grade._count?.students || 0}</TableCell>
                  <TableCell>{grade._count?.classess || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditGrade(grade)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGrade(grade.id)}
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

      <CreateGradeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGrade(null);
        }}
        onCreate={handleCreateGrade}
        onUpdate={handleUpdateGrade}
        initialData={editingGrade}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Grades;

