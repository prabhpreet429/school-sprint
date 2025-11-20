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
import { useGetClassesQuery } from "@/state/api";

type AnnouncementFormData = {
  title: string;
  description: string;
  date: string;
  schoolId: number;
  classId?: number | null;
};

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (announcementData: AnnouncementFormData) => void;
  onUpdate?: (id: number, announcementData: AnnouncementFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateAnnouncementModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateAnnouncementModalProps) => {
  const isEditMode = !!initialData;
  // Fetch classes
  const { data: classesData } = useGetClassesQuery({ schoolId, search: "" });
  const classes = classesData?.data || [];

  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    description: "",
    date: "",
    schoolId,
    classId: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to format date in local timezone (YYYY-MM-DD)
  // Extracts date directly from ISO string to avoid timezone conversion issues
  const formatDateLocal = (date: Date | string): string => {
    if (!date) return "";
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    // If it's an ISO string, extract the date part directly (YYYY-MM-DD)
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    // If it's already in YYYY-MM-DD format, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    // Fallback: create date and format
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      const date = initialData.date 
        ? formatDateLocal(initialData.date)
        : "";
      
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        date,
        schoolId,
        classId: initialData.classId || initialData.class?.id || null,
      });
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        date: "",
        schoolId,
        classId: null,
      });
      setErrors({});
    }
  }, [isOpen, initialData, schoolId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      [name]: value === "none" ? null : Number(value),
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

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isEditMode && onUpdate && initialData) {
        onUpdate(initialData.id, formData);
      } else {
        onCreate(formData);
        // Reset form only for create mode
        setFormData({
          title: "",
          description: "",
          date: "",
          schoolId,
          classId: null,
        });
      }
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the announcement information below."
              : "Fill in the announcement information to create a new announcement."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter announcement title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter announcement description"
                rows={4}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Class (Optional)
                </label>
                <Select
                  value={formData.classId ? formData.classId.toString() : "none"}
                  onValueChange={(value) => handleSelectChange("classId", value)}
                >
                  <SelectTrigger className="w-full min-w-[200px]">
                    <SelectValue placeholder="Select class (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Classes</SelectItem>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id.toString()}>
                        {classItem.name} {classItem.grade ? `(Grade ${classItem.grade.level})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {isEditMode ? "Update Announcement" : "Create Announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAnnouncementModal;

