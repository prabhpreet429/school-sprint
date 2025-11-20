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

interface AssignFeesByGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: { gradeId: number; schoolId: number; dueDate: string; academicYear?: string; term?: string }) => void;
  schoolId: number;
}

const AssignFeesByGradeModal = ({
  isOpen,
  onClose,
  onAssign,
  schoolId,
}: AssignFeesByGradeModalProps) => {
  const { data: gradesData } = useGetGradesQuery({ schoolId });
  const grades = gradesData?.data || [];

  const [formData, setFormData] = useState({
    gradeId: 0,
    dueDate: "",
    academicYear: "",
    term: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default date to today when modal opens
  useEffect(() => {
    if (isOpen && !formData.dueDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setFormData((prev) => ({
        ...prev,
        dueDate: `${year}-${month}-${day}`,
      }));
    }
  }, [isOpen]);

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

    if (!formData.gradeId || formData.gradeId === 0) {
      newErrors.gradeId = "Grade is required";
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

    onAssign({
      gradeId: formData.gradeId,
      schoolId,
      dueDate: formData.dueDate,
      academicYear: formData.academicYear || undefined,
      term: formData.term || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Fees by Grade</DialogTitle>
          <DialogDescription>
            Assign all active fees for a specific grade to all students in that grade.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Grade <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.gradeId === 0 ? "" : String(formData.gradeId)}
                onValueChange={(value) => handleSelectChange("gradeId", value)}
              >
                <SelectTrigger className={errors.gradeId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade: any) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      Grade {grade.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gradeId && (
                <p className="text-red-500 text-xs mt-1">{errors.gradeId}</p>
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
              Assign Fees
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFeesByGradeModal;

