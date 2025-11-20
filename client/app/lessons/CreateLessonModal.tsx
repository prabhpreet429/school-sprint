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
import { useGetClassesQuery, useGetSubjectsQuery, useGetTeachersQuery } from "@/state/api";

type LessonFormData = {
  name: string;
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
  startTime: string;
  endTime: string;
  schoolId: number;
  subjectId: number;
  classId: number;
  teacherId: number;
};

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (lessonData: LessonFormData) => void;
  onUpdate?: (id: number, lessonData: LessonFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateLessonModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateLessonModalProps) => {
  const isEditMode = !!initialData;
  // Fetch classes, subjects, and teachers
  const { data: classesData } = useGetClassesQuery({ schoolId, search: "" });
  const { data: subjectsData } = useGetSubjectsQuery({ schoolId, search: "" });
  const { data: teachersData } = useGetTeachersQuery({ schoolId, search: "" });
  const classes = classesData?.data || [];
  const subjects = subjectsData?.data || [];
  const teachers = teachersData?.data || [];

  const [formData, setFormData] = useState<LessonFormData>({
    name: "",
    day: "MONDAY",
    startTime: "",
    endTime: "",
    schoolId,
    subjectId: 0,
    classId: 0,
    teacherId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to format time in local timezone (HH:mm)
  const formatTimeLocal = (date: Date | string): string => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date) : date;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Helper to convert HH:mm to datetime-local format
  const timeToDateTimeLocal = (time: string, baseDate?: Date): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const date = baseDate || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      const startTime = initialData.startTime 
        ? formatTimeLocal(initialData.startTime)
        : "";
      const endTime = initialData.endTime 
        ? formatTimeLocal(initialData.endTime)
        : "";
      
      setFormData({
        name: initialData.name || "",
        day: initialData.day || "MONDAY",
        startTime: timeToDateTimeLocal(startTime),
        endTime: timeToDateTimeLocal(endTime),
        schoolId,
        subjectId: initialData.subjectId || initialData.subject?.id || 0,
        classId: initialData.classId || initialData.class?.id || 0,
        teacherId: initialData.teacherId || initialData.teacher?.id || 0,
      });
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        name: "",
        day: "MONDAY",
        startTime: "",
        endTime: "",
        schoolId,
        subjectId: 0,
        classId: 0,
        teacherId: 0,
      });
      setErrors({});
    }
  }, [isOpen, initialData, schoolId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
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
      [name]: value === "none" ? (name === "day" ? "MONDAY" : 0) : (name === "day" ? value : Number(value)),
    }));
    // Clear error when user selects
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
      newErrors.name = "Name is required";
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
    if (!formData.subjectId || formData.subjectId === 0) {
      newErrors.subjectId = "Subject is required";
    }
    if (!formData.classId || formData.classId === 0) {
      newErrors.classId = "Class is required";
    }
    if (!formData.teacherId || formData.teacherId === 0) {
      newErrors.teacherId = "Teacher is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Convert datetime-local to proper DateTime format for API
    const startTime = new Date(formData.startTime).toISOString();
    const endTime = new Date(formData.endTime).toISOString();

    const lessonData = {
      ...formData,
      startTime,
      endTime,
    };

    if (isEditMode && initialData?.id) {
      onUpdate?.(initialData.id, lessonData);
    } else {
      onCreate(lessonData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Lesson" : "Create New Lesson"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the lesson information below."
              : "Fill in the information to create a new lesson."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter lesson name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Day */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Day <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.day}
                onValueChange={(value) => handleSelectChange("day", value)}
              >
                <SelectTrigger className={errors.day ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONDAY">Monday</SelectItem>
                  <SelectItem value="TUESDAY">Tuesday</SelectItem>
                  <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                  <SelectItem value="THURSDAY">Thursday</SelectItem>
                  <SelectItem value="FRIDAY">Friday</SelectItem>
                </SelectContent>
              </Select>
              {errors.day && (
                <p className="text-red-500 text-xs mt-1">{errors.day}</p>
              )}
            </div>

            {/* Start Time */}
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

            {/* End Time */}
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

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.subjectId === 0 ? "none" : String(formData.subjectId)}
                onValueChange={(value) => handleSelectChange("subjectId", value)}
              >
                <SelectTrigger className={errors.subjectId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject: any) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && (
                <p className="text-red-500 text-xs mt-1">{errors.subjectId}</p>
              )}
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.classId === 0 ? "none" : String(formData.classId)}
                onValueChange={(value) => handleSelectChange("classId", value)}
              >
                <SelectTrigger className={errors.classId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem: any) => (
                    <SelectItem key={classItem.id} value={String(classItem.id)}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && (
                <p className="text-red-500 text-xs mt-1">{errors.classId}</p>
              )}
            </div>

            {/* Teacher */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Teacher <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.teacherId === 0 ? "none" : String(formData.teacherId)}
                onValueChange={(value) => handleSelectChange("teacherId", value)}
              >
                <SelectTrigger className={errors.teacherId ? "border-red-500 min-w-[200px]" : "min-w-[200px]"}>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher: any) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.name} {teacher.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teacherId && (
                <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>
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
              {isEditMode ? "Update Lesson" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLessonModal;

