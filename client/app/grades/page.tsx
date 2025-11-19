"use client";

import { useGetGradesQuery, useCreateGradeMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon } from "lucide-react";
import CreateGradeModal from "./CreateGradeModal";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { 
    field: "level", 
    headerName: "Grade Level", 
    width: 150,
  },
  {
    field: "students",
    headerName: "Students",
    width: 120,
    valueGetter: (value, row) => row._count?.students || 0,
  },
  {
    field: "classes",
    headerName: "Classes",
    width: 120,
    valueGetter: (value, row) => row._count?.classess || 0,
  },
];

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

  const handleCreateGrade = async (gradeData: { level: number; schoolId: number }) => {
    try {
      await createGrade(gradeData).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create grade:", error);
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

      <div style={{ height: "calc(100vh - 200px)", width: "100%" }}>
        <DataGrid
          rows={grades}
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

      <CreateGradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateGrade}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Grades;

