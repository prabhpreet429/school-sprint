"use client"; 

import { useGetStudentsQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon, Edit, Trash2, Eye } from "lucide-react";
import CreateStudentModal from "./CreateStudentModal";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Students = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Require schoolId - no fallback
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

  const {
    data: studentsData,
    isLoading,
    isError,
  } = useGetStudentsQuery({
    schoolId,
    search: searchTerm || undefined,
  });

  const [createStudent] = useCreateStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const [editingStudent, setEditingStudent] = useState<any>(null);

  const handleCreateStudent = async (studentData: any) => {
    try {
      await createStudent({ ...studentData, schoolId }).unwrap();
      setIsModalOpen(false);
      setEditingStudent(null);
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  const handleUpdateStudent = async (id: number, studentData: any) => {
    try {
      await updateStudent({ id, data: { ...studentData, schoolId } }).unwrap();
      setIsModalOpen(false);
      setEditingStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id).unwrap();
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student");
      }
    }
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !studentsData) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch students
      </div>
    );
  }

  const students = studentsData?.data || [];

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Students" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create
          Student
        </button>
      </div>

      {/* BODY STUDENTS LIST */}
      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead className="whitespace-nowrap">Image</TableHead>
              <TableHead className="whitespace-nowrap">First Name</TableHead>
              <TableHead className="whitespace-nowrap">Last Name</TableHead>
              <TableHead className="whitespace-nowrap">Username</TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Phone</TableHead>
              <TableHead className="whitespace-nowrap">Gender</TableHead>
              <TableHead className="whitespace-nowrap">Blood Type</TableHead>
              <TableHead className="whitespace-nowrap">Class</TableHead>
              <TableHead className="whitespace-nowrap">Parents</TableHead>
              <TableHead className="whitespace-nowrap">Birthday</TableHead>
              <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              students.map((student: any) => (
                <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell className="whitespace-nowrap">
                    {student.img ? (
                      <img
                        src={student.img}
                        alt={`${student.name} ${student.surname}`}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                        {student.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{student.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.surname}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.username}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.email || "N/A"}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.phone || "N/A"}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.sex === "MALE" ? "Male" : "Female"}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.bloodType}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.class?.name || "N/A"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {!student.studentParents || student.studentParents.length === 0
                      ? "N/A"
                      : student.studentParents
                          .map((sp: any) => `${sp.relationship}: ${sp.parent.name} ${sp.parent.surname}`)
                          .join(", ")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {student.birthday
                      ? (() => {
                          // Extract date part directly to avoid timezone conversion
                          const dateStr = typeof student.birthday === 'string' 
                            ? student.birthday 
                            : student.birthday.toISOString();
                          const dateOnly = dateStr.includes('T') 
                            ? dateStr.split('T')[0] 
                            : dateStr;
                          const [year, month, day] = dateOnly.split('-');
                          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                          return date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          });
                        })()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/students/${student.id}?schoolId=${schoolId}`}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 cursor-pointer"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
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
      <CreateStudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        onCreate={handleCreateStudent}
        onUpdate={handleUpdateStudent}
        initialData={editingStudent}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Students;