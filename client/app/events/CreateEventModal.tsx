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
import { convertLocalToUTC, convertUTCToLocal } from "@/lib/dateUtils";

type EventFormData = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  schoolId: number;
  classId?: number | null;
};

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (eventData: EventFormData) => void;
  onUpdate?: (id: number, eventData: EventFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateEventModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateEventModalProps) => {
  const isEditMode = !!initialData;
  // Fetch classes
  const { data: classesData } = useGetClassesQuery({ schoolId, search: "" });
  const classes = classesData?.data || [];

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    schoolId,
    classId: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});


  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      const startTime = initialData.startTime 
        ? convertUTCToLocal(initialData.startTime)
        : "";
      const endTime = initialData.endTime 
        ? convertUTCToLocal(initialData.endTime)
        : "";
      
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        startTime,
        endTime,
        schoolId,
        classId: initialData.classId || initialData.class?.id || null,
      });
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert datetime-local strings to ISO strings (UTC) before sending to backend
      const eventData = {
        ...formData,
        startTime: convertLocalToUTC(formData.startTime),
        endTime: convertLocalToUTC(formData.endTime),
      };

      if (isEditMode && onUpdate && initialData) {
        onUpdate(initialData.id, eventData);
      } else {
        onCreate(eventData);
        // Reset form only for create mode
        setFormData({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
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
          <DialogTitle>{isEditMode ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the event information below."
              : "Fill in the event information to create a new event."}
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
                placeholder="Enter event title"
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
                placeholder="Enter event description"
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

              {/* Class */}
              <div className="col-span-2">
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
              {isEditMode ? "Update Event" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;

