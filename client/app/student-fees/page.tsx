"use client";

import { useGetStudentFeesQuery, useCreateStudentFeeMutation, useUpdateStudentFeeMutation, useDeleteStudentFeeMutation, useAssignFeesByGradeMutation, useGetGradesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon, Edit, Trash2, Users } from "lucide-react";
import CreateStudentFeeModal from "./CreateStudentFeeModal";
import AssignFeesByGradeModal from "./AssignFeesByGradeModal";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StudentFees = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingStudentFee, setEditingStudentFee] = useState<any>(null);

  if (!schoolIdParam) {
    return (
      <div className="py-4">
        <div className="text-center text-red-500 py-4">
          Access Denied
        </div>
      </div>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);

  if (isNaN(schoolId)) {
    return (
      <div className="py-4">
        <div className="text-center text-red-500 py-4">
          Access Denied
        </div>
      </div>
    );
  }

  const { data, error, isLoading, isFetching } = useGetStudentFeesQuery({ schoolId });
  const [createStudentFee] = useCreateStudentFeeMutation();
  const [updateStudentFee] = useUpdateStudentFeeMutation();
  const [deleteStudentFee] = useDeleteStudentFeeMutation();
  const [assignFeesByGrade] = useAssignFeesByGradeMutation();

  const handleCreateStudentFee = async (studentFeeData: any) => {
    try {
      await createStudentFee(studentFeeData).unwrap();
      setIsModalOpen(false);
      setEditingStudentFee(null);
    } catch (error) {
      console.error("Failed to create student fee:", error);
    }
  };

  const handleUpdateStudentFee = async (id: number, studentFeeData: any) => {
    try {
      await updateStudentFee({ id, data: studentFeeData }).unwrap();
      setIsModalOpen(false);
      setEditingStudentFee(null);
    } catch (error) {
      console.error("Error updating student fee:", error);
    }
  };

  const handleEditStudentFee = (studentFee: any) => {
    setEditingStudentFee(studentFee);
    setIsModalOpen(true);
  };

  const handleDeleteStudentFee = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this student fee?")) {
      try {
        await deleteStudentFee(id).unwrap();
      } catch (error) {
        console.error("Error deleting student fee:", error);
        alert("Failed to delete student fee");
      }
    }
  };

  const handleAssignByGrade = async (data: any) => {
    try {
      await assignFeesByGrade(data).unwrap();
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error("Failed to assign fees by grade:", error);
    }
  };

  // Helper function to format date without timezone issues
  const formatDateLocal = (dateString: string | Date): string => {
    if (!dateString) return "N/A";
    let date: Date;
    if (typeof dateString === 'string') {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = dateString;
    }
    return format(date, "MMM dd, yyyy");
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
          Failed to fetch student fees
        </p>
      </div>
    );
  }

  const studentFees = data?.data || [];
  const filteredStudentFees = studentFees.filter((studentFee: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      studentFee.student?.name.toLowerCase().includes(searchLower) ||
      studentFee.student?.surname.toLowerCase().includes(searchLower) ||
      studentFee.fee?.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search student fees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Header name="Student Fees" />
        <div className="flex gap-2">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer"
          >
            <Users size={20} />
            Assign by Grade
          </button>
          <button
            onClick={() => {
              setEditingStudentFee(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            <PlusCircleIcon size={20} />
            Create Student Fee
          </button>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudentFees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No student fees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudentFees.map((studentFee: any) => {
                  const remaining = studentFee.amount - studentFee.paidAmount;
                  return (
                    <TableRow key={studentFee.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <TableCell className="font-medium">
                        {studentFee.student ? `${studentFee.student.name} ${studentFee.student.surname}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        {studentFee.student?.class?.name || "N/A"}
                      </TableCell>
                      <TableCell>{studentFee.fee?.name || "N/A"}</TableCell>
                      <TableCell>${studentFee.amount.toFixed(2)}</TableCell>
                      <TableCell>${studentFee.paidAmount.toFixed(2)}</TableCell>
                      <TableCell>{formatDateLocal(studentFee.dueDate)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          studentFee.status === "PAID"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : studentFee.status === "PARTIAL"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : studentFee.status === "OVERDUE"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}>
                          {studentFee.status}
                          {remaining > 0 && ` ($${remaining.toFixed(2)} remaining)`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditStudentFee(studentFee)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudentFee(studentFee.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODALS */}
      <CreateStudentFeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudentFee(null);
        }}
        onCreate={handleCreateStudentFee}
        onUpdate={handleUpdateStudentFee}
        initialData={editingStudentFee}
        schoolId={schoolId}
      />
      <AssignFeesByGradeModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignByGrade}
        schoolId={schoolId}
      />
    </div>
  );
};

export default StudentFees;

