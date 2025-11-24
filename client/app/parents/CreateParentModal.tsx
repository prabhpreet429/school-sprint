"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ParentFormData = {
  username: string;
  name: string;
  surname: string;
  addressLine1: string;
  schoolId: number;
  phone: string;
  email?: string;
};

interface CreateParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (parentData: ParentFormData) => void;
  onUpdate?: (id: number, parentData: ParentFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateParentModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateParentModalProps) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState<ParentFormData>({
    username: "",
    name: "",
    surname: "",
    addressLine1: "",
    schoolId,
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        username: initialData.username || "",
        name: initialData.name || "",
        surname: initialData.surname || "",
        addressLine1: initialData.addressLine1 || "",
        schoolId,
        phone: initialData.phone || "",
        email: initialData.email || "",
      });
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        username: "",
        name: "",
        surname: "",
        addressLine1: "",
        schoolId,
        phone: "",
        email: "",
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

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required";
    }
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert optional fields
      const parentData: ParentFormData = {
        ...formData,
        email: formData.email || undefined,
      };
      
      if (isEditMode && onUpdate && initialData) {
        onUpdate(initialData.id, parentData);
      } else {
        onCreate(parentData);
        // Reset form only for create mode
        setFormData({
          username: "",
          name: "",
          surname: "",
          addressLine1: "",
          schoolId,
          phone: "",
          email: "",
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
          <DialogTitle>{isEditMode ? "Edit Parent" : "Create Parent"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the parent information below."
              : "Fill in the parent information to create a new parent record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter first name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Surname */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Enter last name"
                className={errors.surname ? "border-red-500" : ""}
              />
              {errors.surname && (
                <p className="text-red-500 text-xs mt-1">{errors.surname}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email (optional)"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Enter address"
                className={errors.addressLine1 ? "border-red-500" : ""}
              />
              {errors.addressLine1 && (
                <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
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
              {isEditMode ? "Update Parent" : "Create Parent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateParentModal;

