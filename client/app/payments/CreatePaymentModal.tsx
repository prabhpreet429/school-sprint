"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetStudentsQuery, useGetStudentFeesQuery } from "@/state/api";
import { X } from "lucide-react";

type PaymentFormData = {
  studentId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: "CASH" | "CARD" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";
  referenceNumber?: string;
  notes?: string;
  feeAllocations?: Array<{ studentFeeId: number; amount: number }>;
};

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (paymentData: PaymentFormData) => void;
  onUpdate?: (id: number, paymentData: PaymentFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreatePaymentModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreatePaymentModalProps) => {
  const isEditMode = !!initialData;
  const { data: studentsData } = useGetStudentsQuery({ schoolId, search: "" });
  const students = studentsData?.data || [];

  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const { data: studentFeesData } = useGetStudentFeesQuery(
    { schoolId, studentId: selectedStudentId },
    { skip: !selectedStudentId || selectedStudentId === 0 }
  );
  const studentFees = studentFeesData?.data || [];

  const [formData, setFormData] = useState<PaymentFormData>({
    studentId: 0,
    amount: 0,
    paymentDate: "",
    paymentMethod: "CASH",
    referenceNumber: "",
    notes: "",
    feeAllocations: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allocations, setAllocations] = useState<Array<{ studentFeeId: number; amount: number }>>([]);

  // Helper function to format date-local in local timezone (YYYY-MM-DD)
  const formatDateLocal = (date: Date | string): string => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        studentId: initialData.studentId || 0,
        amount: initialData.amount || 0,
        paymentDate: formatDateLocal(initialData.paymentDate),
        paymentMethod: initialData.paymentMethod || "CASH",
        referenceNumber: initialData.referenceNumber || "",
        notes: initialData.notes || "",
        feeAllocations: initialData.feePayments?.map((fp: any) => ({
          studentFeeId: fp.studentFeeId,
          amount: fp.amount,
        })) || [],
      });
      setSelectedStudentId(initialData.studentId || 0);
      setAllocations(initialData.feePayments?.map((fp: any) => ({
        studentFeeId: fp.studentFeeId,
        amount: fp.amount,
      })) || []);
    } else if (isOpen && !initialData) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setFormData({
        studentId: 0,
        amount: 0,
        paymentDate: `${year}-${month}-${day}`,
        paymentMethod: "CASH",
        referenceNumber: "",
        notes: "",
        feeAllocations: [],
      });
      setSelectedStudentId(0);
      setAllocations([]);
    }
    setErrors({});
  }, [isOpen, initialData]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, studentId: selectedStudentId }));
  }, [selectedStudentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "studentId") {
      setSelectedStudentId(value === "none" ? 0 : parseInt(value, 10));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addAllocation = () => {
    if (studentFees.length === 0) return;
    const firstUnpaidFee = studentFees.find((sf: any) => sf.status !== "PAID");
    if (firstUnpaidFee) {
      setAllocations((prev) => [
        ...prev,
        { studentFeeId: firstUnpaidFee.id, amount: 0 },
      ]);
    }
  };

  const removeAllocation = (index: number) => {
    setAllocations((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAllocation = (index: number, field: "studentFeeId" | "amount", value: number) => {
    setAllocations((prev) =>
      prev.map((alloc, i) =>
        i === index ? { ...alloc, [field]: value } : alloc
      )
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId || formData.studentId === 0) {
      newErrors.studentId = "Student is required";
    }
    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    // Validate allocations
    const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
    if (allocations.length > 0 && totalAllocated > formData.amount) {
      newErrors.allocations = "Total allocated amount cannot exceed payment amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const paymentData = {
      ...formData,
      schoolId,
      feeAllocations: allocations.length > 0 ? allocations : undefined,
    };

    if (isEditMode && initialData?.id) {
      onUpdate?.(initialData.id, paymentData);
    } else {
      onCreate(paymentData);
    }
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  const remaining = formData.amount - totalAllocated;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Payment" : "Record Payment"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the payment information below."
              : "Record a payment for a student. Optionally allocate it to specific fees."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Student <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.studentId === 0 ? "" : String(formData.studentId)}
                  onValueChange={(value) => handleSelectChange("studentId", value)}
                >
                  <SelectTrigger className={errors.studentId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: any) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.name} {student.surname} {student.class?.name ? `(${student.class.name})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.studentId && (
                  <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className={errors.paymentDate ? "border-red-500" : ""}
                />
                {errors.paymentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                >
                  <SelectTrigger className={errors.paymentMethod ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Reference Number (Optional)
              </label>
              <Input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="e.g., Transaction ID, Cheque Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Notes (Optional)
              </label>
              <Input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes"
              />
            </div>

            {/* Fee Allocations */}
            {selectedStudentId > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Fee Allocations (Optional)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAllocation}
                    disabled={studentFees.filter((sf: any) => sf.status !== "PAID").length === 0}
                    className="cursor-pointer"
                  >
                    Add Allocation
                  </Button>
                </div>
                {allocations.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {allocations.map((alloc, index) => {
                      const studentFee = studentFees.find((sf: any) => sf.id === alloc.studentFeeId);
                      return (
                        <div key={index} className="flex gap-2 items-center p-2 border rounded">
                          <Select
                            value={String(alloc.studentFeeId)}
                            onValueChange={(value) =>
                              updateAllocation(index, "studentFeeId", parseInt(value, 10))
                            }
                          >
                            <SelectTrigger className="flex-1 min-w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {studentFees
                                .filter((sf: any) => sf.status !== "PAID")
                                .map((sf: any) => {
                                  const remainingForFee = sf.amount - sf.paidAmount;
                                  return (
                                    <SelectItem key={sf.id} value={String(sf.id)}>
                                      {sf.fee?.name} - ${sf.amount.toFixed(2)} (${remainingForFee.toFixed(2)} remaining)
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            value={alloc.amount}
                            onChange={(e) =>
                              updateAllocation(index, "amount", parseFloat(e.target.value) || 0)
                            }
                            min="0"
                            step="0.01"
                            placeholder="Amount"
                            className="w-32"
                          />
                          <button
                            type="button"
                            onClick={() => removeAllocation(index)}
                            className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {allocations.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Total Allocated: ${totalAllocated.toFixed(2)}</div>
                    <div>Remaining: ${remaining.toFixed(2)}</div>
                  </div>
                )}
                {errors.allocations && (
                  <p className="text-red-500 text-xs mt-1">{errors.allocations}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">
              {isEditMode ? "Update" : "Record"} Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePaymentModal;

