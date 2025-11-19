"use client";

import { useGetParentsQuery, useUpdateParentMutation, useDeleteParentMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchIcon, Edit, Trash2 } from "lucide-react";
import CreateParentModal from "./CreateParentModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [updateParent] = useUpdateParentMutation();
  const [deleteParent] = useDeleteParentMutation();
  const [editingParent, setEditingParent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateParent = async (id: number, parentData: any) => {
    try {
      await updateParent({ id, data: { ...parentData, schoolId } }).unwrap();
      setIsModalOpen(false);
      setEditingParent(null);
    } catch (error) {
      console.error("Error updating parent:", error);
    }
  };

  const handleEditParent = (parent: any) => {
    setEditingParent(parent);
    setIsModalOpen(true);
  };

  const handleDeleteParent = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this parent?")) {
      try {
        await deleteParent(id).unwrap();
      } catch (error) {
        console.error("Error deleting parent:", error);
        alert("Failed to delete parent");
      }
    }
  };

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
      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead>Username</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No parents found
                </TableCell>
              </TableRow>
            ) : (
              parents.map((parent: any) => (
                <TableRow key={parent.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell>{parent.username}</TableCell>
                  <TableCell>{parent.name}</TableCell>
                  <TableCell>{parent.surname}</TableCell>
                  <TableCell>{parent.email || "N/A"}</TableCell>
                  <TableCell>{parent.phone}</TableCell>
                  <TableCell>{parent.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditParent(parent)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteParent(parent.id)}
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
      <CreateParentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingParent(null);
        }}
        onCreate={() => {}}
        onUpdate={handleUpdateParent}
        initialData={editingParent}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Parents;

