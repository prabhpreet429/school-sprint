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
import { useGetLessonsQuery } from "@/state/api";

type ExamFormData = {
  title: string;
  startTime: string;
  endTime: string;
  schoolId: number;
  lessonId: number;
};

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (examData: ExamFormData) => void;
  onUpdate?: (id: number, examData: ExamFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateExamModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateExamModalProps) => {
  const isEditMode = !!initialData;
  const { data: lessonsData } = useGetLessonsQuery({ schoolId, search: "" });
  const lessons = lessonsData?.data || [];

  const [formData, setFormData] = useState<ExamFormData>({
    title: "",
    startTime: "",
    endTime: "",
    schoolId,
    lessonId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDateTimeLocal = (date: Date | string): string => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || "",
        startTime: initialData.startTime ? formatDateTimeLocal(initialData.startTime) : "",
        endTime: initialData.endTime ? formatDateTimeLocal(initialData.endTime) : "",
        schoolId,
        lessonId: initialData.lessonId || initialData.lesson?.id || 0,
      });
    } else if (isOpen && !initialData) {
      setFormData({
        title: "",
        startTime: "",
        endTime: "",
        schoolId,
        lessonId: 0,
      });
      setErrors({});
    }
  }, [isOpen, initialData, schoolId]);

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
      [name]: value === "none" ? 0 : Number(value),
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

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (start >= end) {
        newErrors.endTime = "End time must be after start time";
      }
    }
    if (!formData.lessonId || formData.lessonId === 0) {
      newErrors.lessonId = "Lesson is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const startTime = new Date(formData.startTime).toISOString();
    const endTime = new Date(formData.endTime).toISOString();

    const examData = {
      ...formData,
      startTime,
      endTime,
    };

    if (isEditMode && initialData?.id) {
      onUpdate?.(initialData.id, examData);
    } else {
      onCreate(examData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Exam" : "Create New Exam"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the exam information below."
              : "Fill in the information to create a new exam."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter exam title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? "border-red-500" : ""}
              />
              {errors.startTime && (
                <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={errors.endTime ? "border-red-500" : ""}
              />
              {errors.endTime && (
                <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Lesson <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.lessonId === 0 ? "none" : String(formData.lessonId)}
                onValueChange={(value) => handleSelectChange("lessonId", value)}
              >
                <SelectTrigger className={errors.lessonId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson: any) => (
                    <SelectItem key={lesson.id} value={String(lesson.id)}>
                      {lesson.name} - {lesson.subject?.name} ({lesson.class?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.lessonId && (
                <p className="text-red-500 text-xs mt-1">{errors.lessonId}</p>
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
              {isEditMode ? "Update Exam" : "Create Exam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamModal;

