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
import { useGetGradesQuery } from "@/state/api";

type FeeFormData = {
  name: string;
  amount: number;
  frequency: "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  gradeId: number | null;
  isActive: boolean;
};

interface CreateFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (feeData: FeeFormData) => void;
  onUpdate?: (id: number, feeData: FeeFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateFeeModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateFeeModalProps) => {
  const isEditMode = !!initialData;
  const { data: gradesData } = useGetGradesQuery({ schoolId });
  const grades = gradesData?.data || [];

  const [formData, setFormData] = useState<FeeFormData>({
    name: "",
    amount: 0,
    frequency: "YEARLY",
    gradeId: null,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || "",
        amount: initialData.amount || 0,
        frequency: initialData.frequency || "YEARLY",
        gradeId: initialData.gradeId || null,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else if (isOpen && !initialData) {
      setFormData({
        name: "",
        amount: 0,
        frequency: "YEARLY",
        gradeId: null,
        isActive: true,
      });
    }
    setErrors({});
  }, [isOpen, initialData]);

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
    setFormData((prev) => ({
      ...prev,
      [name]: value === "none" ? null : (name === "gradeId" ? parseInt(value, 10) : value),
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

    if (!formData.name.trim()) {
      newErrors.name = "Fee name is required";
    }
    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.frequency) {
      newErrors.frequency = "Frequency is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const feeData = {
      ...formData,
      schoolId,
    };

    if (isEditMode && initialData?.id) {
      onUpdate?.(initialData.id, feeData);
    } else {
      onCreate(feeData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Fee" : "Create New Fee"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the fee information below."
              : "Fill in the information to create a new fee template."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Fee Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Tuition Fee, Library Fee"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
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
                  Frequency <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => handleSelectChange("frequency", value)}
                >
                  <SelectTrigger className={errors.frequency ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONE_TIME">One Time</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.frequency && (
                  <p className="text-red-500 text-xs mt-1">{errors.frequency}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Grade (Optional)
              </label>
              <Select
                value={formData.gradeId ? String(formData.gradeId) : ""}
                onValueChange={(value) => handleSelectChange("gradeId", value)}
              >
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="Select grade (leave empty for all grades)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Grades</SelectItem>
                  {grades.map((grade: any) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      Grade {grade.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="cursor-pointer"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
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
              {isEditMode ? "Update" : "Create"} Fee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFeeModal;

