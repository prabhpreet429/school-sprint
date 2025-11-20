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
import { Button } from "@/components/ui/button";

interface CreateGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (gradeData: { level: number; schoolId: number }) => void;
  onUpdate?: (id: number, gradeData: { level: number; schoolId: number }) => void;
  initialData?: any;
  schoolId: number;
}

const CreateGradeModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateGradeModalProps) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    level: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        level: initialData.level?.toString() || "",
      });
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        level: "",
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.level.trim()) {
      newErrors.level = "Grade level is required";
    } else {
      const level = Number(formData.level);
      if (isNaN(level) || level < 1) {
        newErrors.level = "Grade level must be a valid positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const gradeData = {
        level: Number(formData.level),
        schoolId,
      };
      
      if (isEditMode && onUpdate && initialData) {
        onUpdate(initialData.id, gradeData);
      } else {
        onCreate(gradeData);
        // Reset form only for create mode
        setFormData({
          level: "",
        });
      }
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Grade" : "Create Grade"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the grade level below."
              : "Fill in the grade information to create a new grade level."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Grade Level <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="level"
                value={formData.level}
                onChange={handleChange}
                placeholder="Enter grade level (e.g., 1, 2, 3)"
                min="1"
                className={errors.level ? "border-red-500" : ""}
              />
              {errors.level && (
                <p className="text-red-500 text-xs mt-1">{errors.level}</p>
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
            <Button type="submit" className="cursor-pointer">
              {isEditMode ? "Update Grade" : "Create Grade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGradeModal;

