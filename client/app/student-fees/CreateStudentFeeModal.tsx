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
import { useGetStudentsQuery, useGetFeesQuery } from "@/state/api";

type StudentFeeFormData = {
  studentId: number;
  feeId: number;
  amount: number;
  dueDate: string;
  academicYear?: string;
  term?: string;
  notes?: string;
};

interface CreateStudentFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (studentFeeData: StudentFeeFormData) => void;
  onUpdate?: (id: number, studentFeeData: StudentFeeFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateStudentFeeModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateStudentFeeModalProps) => {
  const isEditMode = !!initialData;
  const { data: studentsData } = useGetStudentsQuery({ schoolId, search: "" });
  const { data: feesData } = useGetFeesQuery({ schoolId });
  const students = studentsData?.data || [];
  const fees = feesData?.data || [];

  const [formData, setFormData] = useState<StudentFeeFormData>({
    studentId: 0,
    feeId: 0,
    amount: 0,
    dueDate: "",
    academicYear: "",
    term: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        feeId: initialData.feeId || 0,
        amount: initialData.amount || 0,
        dueDate: formatDateLocal(initialData.dueDate),
        academicYear: initialData.academicYear || "",
        term: initialData.term || "",
        notes: initialData.notes || "",
      });
    } else if (isOpen && !initialData) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setFormData({
        studentId: 0,
        feeId: 0,
        amount: 0,
        dueDate: `${year}-${month}-${day}`,
        academicYear: "",
        term: "",
        notes: "",
      });
    }
    setErrors({});
  }, [isOpen, initialData]);

  // Update amount when fee is selected
  useEffect(() => {
    if (formData.feeId && fees.length > 0) {
      const selectedFee = fees.find((f: any) => f.id === formData.feeId);
      if (selectedFee && !isEditMode) {
        setFormData((prev) => ({
          ...prev,
          amount: selectedFee.amount,
        }));
      }
    }
  }, [formData.feeId, fees, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setFormData((prev) => ({
      ...prev,
      [name]: value === "none" ? 0 : parseInt(value, 10),
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId || formData.studentId === 0) {
      newErrors.studentId = "Student is required";
    }
    if (!formData.feeId || formData.feeId === 0) {
      newErrors.feeId = "Fee is required";
    }
    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const studentFeeData = {
      ...formData,
      schoolId,
    };

    if (isEditMode && initialData?.id) {
      onUpdate?.(initialData.id, studentFeeData);
    } else {
      onCreate(studentFeeData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Student Fee" : "Create New Student Fee"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the student fee information below."
              : "Fill in the information to assign a fee to a student."}
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
                  Fee <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.feeId === 0 ? "" : String(formData.feeId)}
                  onValueChange={(value) => handleSelectChange("feeId", value)}
                >
                  <SelectTrigger className={errors.feeId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                    <SelectValue placeholder="Select fee" />
                  </SelectTrigger>
                  <SelectContent>
                    {fees.map((fee: any) => (
                      <SelectItem key={fee.id} value={String(fee.id)}>
                        {fee.name} {fee.grade ? `(Grade ${fee.grade.level})` : ""} - ${fee.amount.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.feeId && (
                  <p className="text-red-500 text-xs mt-1">{errors.feeId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className={errors.dueDate ? "border-red-500" : ""}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Academic Year (Optional)
                </label>
                <Input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  placeholder="e.g., 2024-2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Term (Optional)
                </label>
                <Input
                  type="text"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  placeholder="e.g., Fall, Spring"
                />
              </div>
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
              {isEditMode ? "Update" : "Create"} Student Fee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudentFeeModal;

