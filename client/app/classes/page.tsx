"use client";

import { useGetClassesQuery, useCreateClassMutation, useGetGradesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon } from "lucide-react";
import CreateClassModal from "./CreateClassModal";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "name", headerName: "Class Name", width: 200 },
  {
    field: "grade",
    headerName: "Grade",
    width: 120,
    valueGetter: (value, row) => `Grade ${row.grade?.level || "N/A"}`,
  },
  {
    field: "capacity",
    headerName: "Capacity",
    width: 120,
  },
  {
    field: "students",
    headerName: "Students",
    width: 120,
    valueGetter: (value, row) => row._count?.students || 0,
  },
  {
    field: "lessons",
    headerName: "Lessons",
    width: 120,
    valueGetter: (value, row) => row._count?.lessons || 0,
  },
  {
    field: "supervisor",
    headerName: "Supervisor",
    width: 200,
    valueGetter: (value, row) => 
      row.supervisor ? `${row.supervisor.name} ${row.supervisor.surname}` : "N/A",
  },
];

const Classes = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  const [searchTerm, setSearchTerm] = useState("");
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

  const { data, error, isLoading, isFetching } = useGetClassesQuery({ 
    schoolId, 
    search: searchTerm || undefined 
  });
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();

  const handleCreateClass = async (classData: any) => {
    try {
      await createClass(classData).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create class:", error);
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

  const classes = data?.data || [];

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Header name="Classes" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          <PlusCircleIcon size={20} />
          Create Class
        </button>
      </div>

      <div style={{ height: "calc(100vh - 250px)", width: "100%" }}>
        <DataGrid
          rows={classes}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell:hover": {
              color: "primary.main",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "var(--color-muted)",
              color: "var(--color-foreground)",
            },
            "& .MuiDataGrid-row": {
              "&:nth-of-type(odd)": {
                backgroundColor: "var(--color-muted)",
              },
              "&:hover": {
                backgroundColor: "var(--color-accent)",
              },
            },
          }}
        />
      </div>

      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateClass}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Classes;

