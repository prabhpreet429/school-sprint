"use client";

import React, { useState, useEffect } from "react";
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
import { useGetGradesQuery, useGetTeachersQuery } from "@/state/api";

type ClassFormData = {
  name: string;
  capacity: number;
  schoolId: number;
  gradeId: number;
  supervisorId?: number;
};

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (classData: ClassFormData) => void;
  onUpdate?: (id: number, classData: ClassFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateClassModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateClassModalProps) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState<ClassFormData>({
    name: "",
    capacity: 0,
    schoolId,
    gradeId: 0,
    supervisorId: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch grades and teachers
  const { data: gradesData } = useGetGradesQuery({ schoolId });
  const { data: teachersData } = useGetTeachersQuery({ schoolId, search: "" });
  const grades = gradesData?.data || [];
  const teachers = teachersData?.data || [];

  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || "",
        capacity: initialData.capacity || 0,
        schoolId,
        gradeId: initialData.gradeId || initialData.grade?.id || 0,
        supervisorId: initialData.supervisorId || initialData.supervisor?.id || undefined,
      });
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        name: "",
        capacity: 0,
        schoolId,
        gradeId: 0,
        supervisorId: undefined,
      });
      setErrors({});
    }
  }, [isOpen, initialData, schoolId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
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
      [name]: value === "none" ? undefined : Number(value),
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
      newErrors.name = "Class name is required";
    }
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be a valid positive number";
    }
    if (!formData.gradeId || formData.gradeId === 0) {
      newErrors.gradeId = "Grade is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const classData = {
        name: formData.name,
        capacity: Number(formData.capacity),
        schoolId,
        gradeId: Number(formData.gradeId),
        supervisorId: formData.supervisorId || undefined,
      };
      
      if (isEditMode && onUpdate && initialData) {
        onUpdate(initialData.id, classData);
      } else {
        onCreate(classData);
        // Reset form only for create mode
        setFormData({
          name: "",
          capacity: 0,
          schoolId,
          gradeId: 0,
          supervisorId: undefined,
        });
      }
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Class" : "Create Class"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the class information below."
              : "Fill in the class information to create a new class."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Class Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Class Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter class name (e.g., Grade 1-A)"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Grade <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.gradeId.toString()}
                onValueChange={(value) => handleSelectChange("gradeId", value)}
              >
                <SelectTrigger
                  className={errors.gradeId ? "border-red-500" : "w-full"}
                >
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      Grade {grade.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gradeId && (
                <p className="text-red-500 text-xs mt-1">{errors.gradeId}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Capacity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="capacity"
                value={formData.capacity || ""}
                onChange={handleChange}
                placeholder="Enter capacity"
                min="1"
                className={errors.capacity ? "border-red-500" : ""}
              />
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
              )}
            </div>

            {/* Supervisor (Optional) */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Supervisor (Teacher)
              </label>
              <Select
                value={formData.supervisorId?.toString() || "none"}
                onValueChange={(value) => handleSelectChange("supervisorId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select supervisor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name} {teacher.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isEditMode ? "Update Class" : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassModal;

