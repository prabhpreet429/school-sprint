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
import { useGetExamsQuery, useGetStudentsQuery } from "@/state/api";

type ResultFormData = {
  score: number;
  schoolId: number;
  studentId: number;
  examId: number | null;
  assignmentId: number | null;
};

interface CreateResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (resultData: ResultFormData) => void;
  onUpdate?: (id: number, resultData: ResultFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateResultModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateResultModalProps) => {
  const isEditMode = !!initialData;
  const { data: examsData } = useGetExamsQuery({ schoolId, search: "" });
  const { data: studentsData } = useGetStudentsQuery({ schoolId, search: "" });
  const exams = examsData?.data || [];
  const students = studentsData?.data || [];

  const [formData, setFormData] = useState<ResultFormData>({
    score: 0,
    schoolId,
    studentId: 0,
    examId: null,
    assignmentId: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        score: initialData.score || 0,
        schoolId,
        studentId: initialData.studentId || initialData.student?.id || 0,
        examId: initialData.examId || initialData.exam?.id || null,
        assignmentId: initialData.assignmentId || initialData.assignment?.id || null,
      });
    } else if (isOpen && !initialData) {
      setFormData({
        score: 0,
        schoolId,
        studentId: 0,
        examId: null,
        assignmentId: null,
      });
      setErrors({});
    }
  }, [isOpen, initialData, schoolId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "score" ? Number(value) : value,
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
      [name]: value === "none" ? (name === "examId" || name === "assignmentId" ? null : 0) : Number(value),
    }));
    // Clear the other type when one is selected
    if (name === "examId" && value !== "none") {
      setFormData((prev) => ({ ...prev, assignmentId: null }));
    }
    if (name === "assignmentId" && value !== "none") {
      setFormData((prev) => ({ ...prev, examId: null }));
    }
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
    if (!formData.examId && !formData.assignmentId) {
      newErrors.examId = "Either Exam or Assignment must be selected";
    }
    if (formData.examId && formData.assignmentId) {
      newErrors.examId = "Cannot select both Exam and Assignment";
    }
    if (formData.score < 0 || formData.score > 100) {
      newErrors.score = "Score must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (isEditMode && initialData?.id) {
      onUpdate?.(initialData.id, formData);
    } else {
      onCreate(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Result" : "Create New Result"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the result information below."
              : "Fill in the information to create a new result."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Student <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.studentId === 0 ? "none" : String(formData.studentId)}
                onValueChange={(value) => handleSelectChange("studentId", value)}
              >
                <SelectTrigger className={errors.studentId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student: any) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name} {student.surname} ({student.class?.name || "N/A"})
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
                Score <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="Enter score (0-100)"
                className={errors.score ? "border-red-500" : ""}
              />
              {errors.score && (
                <p className="text-red-500 text-xs mt-1">{errors.score}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Exam <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.examId === null ? "none" : String(formData.examId)}
                onValueChange={(value) => handleSelectChange("examId", value)}
              >
                <SelectTrigger className={errors.examId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam: any) => (
                    <SelectItem key={exam.id} value={String(exam.id)}>
                      {exam.title} - {exam.lesson?.subject?.name} ({exam.lesson?.class?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.examId && (
                <p className="text-red-500 text-xs mt-1">{errors.examId}</p>
              )}
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
            <Button
              type="submit"
              className="cursor-pointer"
            >
              {isEditMode ? "Update Result" : "Create Result"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateResultModal;

