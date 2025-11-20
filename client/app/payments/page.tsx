"use client";

import { useGetPaymentsQuery, useDeletePaymentMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Payments = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  const [searchTerm, setSearchTerm] = useState("");

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

  const router = useRouter();
  const { data, error, isLoading, isFetching } = useGetPaymentsQuery({ schoolId });
  const [deletePayment] = useDeletePaymentMutation();

  const handleDeletePayment = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await deletePayment(id).unwrap();
      } catch (error) {
        console.error("Error deleting payment:", error);
        alert("Failed to delete payment");
      }
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
          Failed to fetch payments
        </p>
      </div>
    );
  }

  const payments = data?.data || [];
  const filteredPayments = payments.filter((payment: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.student?.name.toLowerCase().includes(searchLower) ||
      payment.student?.surname.toLowerCase().includes(searchLower) ||
      payment.referenceNumber?.toLowerCase().includes(searchLower)
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
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Header name="Payments" />
        <button
          onClick={() => {
            router.push(`/payments/record?schoolId=${schoolId}`);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          <PlusCircleIcon size={20} />
          Record Payments
        </button>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Fees Paid</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment: any) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <TableCell className="font-medium">
                      {payment.student ? `${payment.student.name} ${payment.student.surname}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {payment.student?.class?.name || "N/A"}
                    </TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{formatDateLocal(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <span className="capitalize">{payment.paymentMethod.toLowerCase().replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>{payment.referenceNumber || "N/A"}</TableCell>
                    <TableCell>
                      {payment.feePayments && payment.feePayments.length > 0 ? (
                        <div className="text-sm">
                          {payment.feePayments.map((fp: any, idx: number) => (
                            <div key={idx}>
                              {fp.studentFee.fee.name}: ${fp.amount.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "Not allocated"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
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
    </div>
  );
};

export default Payments;

