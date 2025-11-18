"use client";

import { useGetStudentsQuery, useCreateStudentMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon } from "lucide-react";
import CreateStudentModal from "./CreateStudentModal";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "username", headerName: "Username", width: 150 },
  { field: "name", headerName: "First Name", width: 150 },
  { field: "surname", headerName: "Last Name", width: 150 },
  {
    field: "email",
    headerName: "Email",
    width: 200,
    valueGetter: (value, row) => row.email || "N/A",
  },
  {
    field: "phone",
    headerName: "Phone",
    width: 150,
    valueGetter: (value, row) => row.phone || "N/A",
  },
  {
    field: "sex",
    headerName: "Gender",
    width: 100,
    valueGetter: (value, row) => row.sex === "MALE" ? "Male" : "Female",
  },
  {
    field: "bloodType",
    headerName: "Blood Type",
    width: 120,
  },
  {
    field: "class",
    headerName: "Class",
    width: 150,
    valueGetter: (value, row) => row.class?.name || "N/A",
  },
  {
    field: "grade",
    headerName: "Grade",
    width: 100,
    valueGetter: (value, row) => row.grade?.level || "N/A",
  },
  {
    field: "parent",
    headerName: "Parent",
    width: 200,
    valueGetter: (value, row) => 
      row.parent ? `${row.parent.name} ${row.parent.surname}` : "N/A",
  },
  {
    field: "birthday",
    headerName: "Birthday",
    width: 150,
    valueGetter: (value, row) => {
      if (!row.birthday) return "N/A";
      return new Date(row.birthday).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
];

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

  const handleCreateStudent = async (studentData: any) => {
    try {
      await createStudent({ ...studentData, schoolId }).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating student:", error);
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
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create
          Student
        </button>
      </div>

      {/* BODY STUDENTS LIST */}
      <div className="w-full">
        <DataGrid
          rows={students}
          columns={columns}
          getRowId={(row) => row.id}
          checkboxSelection
          className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 !text-gray-700 dark:!text-gray-300"
          sx={{
            "& .MuiDataGrid-cell": {
              color: "inherit",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "rgb(249 250 251)",
              color: "inherit",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "rgb(249 250 251)",
              color: "inherit",
            },
            "& .MuiDataGrid-toolbarContainer": {
              backgroundColor: "rgb(249 250 251)",
              color: "inherit",
            },
          }}
        />
      </div>

      {/* MODAL */}
      <CreateStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateStudent}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Students;