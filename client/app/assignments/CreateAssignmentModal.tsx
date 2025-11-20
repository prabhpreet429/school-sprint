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

type AssignmentFormData = {
  title: string;
  startDate: string;
  dueDate: string;
  schoolId: number;
  lessonId: number;
};

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (assignmentData: AssignmentFormData) => void;
  onUpdate?: (id: number, assignmentData: AssignmentFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateAssignmentModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateAssignmentModalProps) => {
  const isEditMode = !!initialData;
  // Fetch lessons
  const { data: lessonsData } = useGetLessonsQuery({ schoolId, search: "" });
  const lessons = lessonsData?.data || [];

  const [formData, setFormData] = useState<AssignmentFormData>({
    title: "",
    startDate: "",
    dueDate: "",
    schoolId,
    lessonId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to format datetime-local in local timezone (YYYY-MM-DDTHH:mm)
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

  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || "",
        startDate: formatDateTimeLocal(initialData.startDate),
        dueDate: formatDateTimeLocal(initialData.dueDate),
        schoolId,
        lessonId: initialData.lessonId || 0,
      });
    } else if (isOpen && !initialData) {
      // Reset form for new assignment
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        title: "",
        startDate: formatDateTimeLocal(now),
        dueDate: formatDateTimeLocal(tomorrow),
        schoolId,
        lessonId: 0,
      });
    }
    setErrors({});
  }, [isOpen, initialData, schoolId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      if (due < start) {
        newErrors.dueDate = "Due date must be after start date";
      }
    }
    if (!formData.lessonId || formData.lessonId === 0) {
      newErrors.lessonId = "Lesson is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditMode && initialData && onUpdate) {
      onUpdate(initialData.id, formData);
    } else {
      onCreate(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Assignment" : "Create Assignment"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the assignment details."
              : "Add a new assignment for a lesson."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={errors.title ? "border-red-500" : ""}
                placeholder="Enter assignment title"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="lessonId" className="text-sm font-medium">
                Lesson <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.lessonId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, lessonId: parseInt(value, 10) })
                }
              >
                <SelectTrigger className={errors.lessonId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson: any) => (
                    <SelectItem key={lesson.id} value={lesson.id.toString()}>
                      {lesson.name} {lesson.subject?.name ? `(${lesson.subject.name})` : ""} {lesson.class?.name ? `- ${lesson.class.name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.lessonId && (
                <p className="text-sm text-red-500">{errors.lessonId}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="dueDate" className="text-sm font-medium">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className={errors.dueDate ? "border-red-500" : ""}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-500">{errors.dueDate}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">
              {isEditMode ? "Update" : "Create"} Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentModal;

