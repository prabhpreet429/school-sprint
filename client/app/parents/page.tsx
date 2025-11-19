"use client";

import { useGetParentsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "lucide-react";

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
  },
  {
    field: "address",
    headerName: "Address",
    width: 200,
  },
];

const Parents = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  const [searchTerm, setSearchTerm] = useState("");

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
    data: parentsData,
    isLoading,
    isError,
  } = useGetParentsQuery({
    schoolId,
    search: searchTerm || undefined,
  });

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !parentsData) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch parents
      </div>
    );
  }

  const parents = parentsData?.data || [];

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Search parents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Parents" />
      </div>

      {/* BODY PARENTS LIST */}
      <div className="w-full">
        <DataGrid
          rows={parents}
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
    </div>
  );
};

export default Parents;

