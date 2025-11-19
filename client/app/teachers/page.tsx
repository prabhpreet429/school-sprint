"use client";

import { useGetTeachersQuery, useCreateTeacherMutation, useUpdateTeacherMutation, useDeleteTeacherMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon, Edit, Trash2 } from "lucide-react";
import CreateTeacherModal from "./CreateTeacherModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Teachers = () => {
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
    data: teachersData,
    isLoading,
    isError,
  } = useGetTeachersQuery({
    schoolId,
    search: searchTerm || undefined,
  });

  const [createTeacher] = useCreateTeacherMutation();
  const [updateTeacher] = useUpdateTeacherMutation();
  const [deleteTeacher] = useDeleteTeacherMutation();
  const [editingTeacher, setEditingTeacher] = useState<any>(null);

  const handleCreateTeacher = async (teacherData: any) => {
    try {
      await createTeacher({ ...teacherData, schoolId }).unwrap();
      setIsModalOpen(false);
      setEditingTeacher(null);
    } catch (error) {
      console.error("Error creating teacher:", error);
    }
  };

  const handleUpdateTeacher = async (id: number, teacherData: any) => {
    try {
      await updateTeacher({ id, data: { ...teacherData, schoolId } }).unwrap();
      setIsModalOpen(false);
      setEditingTeacher(null);
    } catch (error) {
      console.error("Error updating teacher:", error);
    }
  };

  const handleEditTeacher = (teacher: any) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await deleteTeacher(id).unwrap();
      } catch (error) {
        console.error("Error deleting teacher:", error);
        alert("Failed to delete teacher");
      }
    }
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !teachersData) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch teachers
      </div>
    );
  }

  const teachers = teachersData?.data || [];

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Teachers" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create
          Teacher
        </button>
      </div>

      {/* BODY TEACHERS LIST */}
      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead>Image</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Blood Type</TableHead>
              <TableHead>Birthday</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No teachers found
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher: any) => (
                <TableRow key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell>
                    {teacher.img ? (
                      <img
                        src={teacher.img}
                        alt={`${teacher.name} ${teacher.surname}`}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                        {teacher.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.surname}</TableCell>
                  <TableCell>{teacher.username}</TableCell>
                  <TableCell>{teacher.email || "N/A"}</TableCell>
                  <TableCell>{teacher.phone || "N/A"}</TableCell>
                  <TableCell>{teacher.sex === "MALE" ? "Male" : "Female"}</TableCell>
                  <TableCell>{teacher.bloodType}</TableCell>
                  <TableCell>
                    {teacher.birthday
                      ? (() => {
                          // Extract date part directly to avoid timezone conversion
                          const dateStr = typeof teacher.birthday === 'string' 
                            ? teacher.birthday 
                            : teacher.birthday.toISOString();
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditTeacher(teacher)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher.id)}
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
      <CreateTeacherModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeacher(null);
        }}
        onCreate={handleCreateTeacher}
        onUpdate={handleUpdateTeacher}
        initialData={editingTeacher}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Teachers;

