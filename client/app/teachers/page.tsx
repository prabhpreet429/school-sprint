"use client";

import { useGetTeachersQuery, useCreateTeacherMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon } from "lucide-react";
import CreateTeacherModal from "./CreateTeacherModal";

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

  const handleCreateTeacher = async (teacherData: any) => {
    try {
      await createTeacher({ ...teacherData, schoolId }).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating teacher:", error);
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
      <div className="w-full">
        <DataGrid
          rows={teachers}
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
      <CreateTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTeacher}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Teachers;

