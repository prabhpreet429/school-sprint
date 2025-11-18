"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

type TeacherFormData = {
  username: string;
  name: string;
  surname: string;
  address: string;
  bloodType: string;
  sex: "MALE" | "FEMALE";
  schoolId: number;
  birthday: string;
  email?: string;
  phone?: string;
  img?: string;
};

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (teacherData: TeacherFormData) => void;
  schoolId: number;
}

const CreateTeacherModal = ({
  isOpen,
  onClose,
  onCreate,
  schoolId,
}: CreateTeacherModalProps) => {
  const [formData, setFormData] = useState<TeacherFormData>({
    username: "",
    name: "",
    surname: "",
    address: "",
    bloodType: "",
    sex: "MALE",
    schoolId,
    birthday: "",
    email: "",
    phone: "",
    img: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      [name]: value,
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

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.bloodType.trim()) {
      newErrors.bloodType = "Blood type is required";
    }
    if (!formData.sex) {
      newErrors.sex = "Gender is required";
    }
    if (!formData.birthday) {
      newErrors.birthday = "Birthday is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert optional fields
      const teacherData: TeacherFormData = {
        ...formData,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        img: formData.img || undefined,
      };
      onCreate(teacherData);
      // Reset form
      setFormData({
        username: "",
        name: "",
        surname: "",
        address: "",
        bloodType: "",
        sex: "MALE",
        schoolId,
        birthday: "",
        email: "",
        phone: "",
        img: "",
      });
      setErrors({});
      onClose();
    }
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Teacher</DialogTitle>
          <DialogDescription>
            Fill in the teacher information to create a new teacher record.
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
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone (optional)"
              />
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.sex}
                onValueChange={(value) =>
                  handleSelectChange("sex", value as "MALE" | "FEMALE")
                }
              >
                <SelectTrigger
                  className={errors.sex ? "border-red-500" : "w-full"}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.sex && (
                <p className="text-red-500 text-xs mt-1">{errors.sex}</p>
              )}
            </div>

            {/* Blood Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Blood Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.bloodType}
                onValueChange={(value) => handleSelectChange("bloodType", value)}
              >
                <SelectTrigger
                  className={errors.bloodType ? "border-red-500" : "w-full"}
                >
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {bloodTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bloodType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.bloodType}
                </p>
              )}
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Birthday <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className={errors.birthday ? "border-red-500" : ""}
              />
              {errors.birthday && (
                <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>
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
              Create Teacher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeacherModal;

