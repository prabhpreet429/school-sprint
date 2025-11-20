"use client";

import { useGetFeesQuery, useCreateFeeMutation, useUpdateFeeMutation, useDeleteFeeMutation, useGetGradesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon, Edit, Trash2 } from "lucide-react";
import CreateFeeModal from "./CreateFeeModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Fees = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);

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

  const { data, error, isLoading, isFetching } = useGetFeesQuery({ schoolId });
  const [createFee] = useCreateFeeMutation();
  const [updateFee] = useUpdateFeeMutation();
  const [deleteFee] = useDeleteFeeMutation();

  const handleCreateFee = async (feeData: any) => {
    try {
      await createFee(feeData).unwrap();
      setIsModalOpen(false);
      setEditingFee(null);
    } catch (error) {
      console.error("Failed to create fee:", error);
    }
  };

  const handleUpdateFee = async (id: number, feeData: any) => {
    try {
      await updateFee({ id, data: feeData }).unwrap();
      setIsModalOpen(false);
      setEditingFee(null);
    } catch (error) {
      console.error("Error updating fee:", error);
    }
  };

  const handleEditFee = (fee: any) => {
    setEditingFee(fee);
    setIsModalOpen(true);
  };

  const handleDeleteFee = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this fee?")) {
      try {
        await deleteFee(id).unwrap();
      } catch (error) {
        console.error("Error deleting fee:", error);
        alert("Failed to delete fee");
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
          Failed to fetch fees
        </p>
      </div>
    );
  }

  const fees = data?.data || [];
  const filteredFees = fees.filter((fee: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      fee.name.toLowerCase().includes(searchLower) ||
      (fee.grade && `Grade ${fee.grade.level}`.toLowerCase().includes(searchLower))
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
            placeholder="Search fees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Header name="Fees" />
        <button
          onClick={() => {
            setEditingFee(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          <PlusCircleIcon size={20} />
          Create Fee
        </button>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No fees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFees.map((fee: any) => (
                  <TableRow key={fee.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell>
                      {fee.grade ? `Grade ${fee.grade.level}` : "All Grades"}
                    </TableCell>
                    <TableCell>${fee.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="capitalize">{fee.frequency.toLowerCase().replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        fee.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                        {fee.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{fee._count?.studentFees || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditFee(fee)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFee(fee.id)}
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
      </div>

      {/* MODAL */}
      <CreateFeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFee(null);
        }}
        onCreate={handleCreateFee}
        onUpdate={handleUpdateFee}
        initialData={editingFee}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Fees;

