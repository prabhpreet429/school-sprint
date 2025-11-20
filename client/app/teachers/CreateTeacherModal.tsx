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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetSubjectsQuery } from "@/state/api";
import { X } from "lucide-react";

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
  subjectIds?: number[];
};

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (teacherData: TeacherFormData) => void;
  onUpdate?: (id: number, teacherData: TeacherFormData) => void;
  initialData?: any;
  schoolId: number;
}

const CreateTeacherModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  schoolId,
}: CreateTeacherModalProps) => {
  const isEditMode = !!initialData;
  const { data: subjectsData } = useGetSubjectsQuery({ schoolId, search: "" });
  const subjects = subjectsData?.data || [];
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

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
    subjectIds: [],
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
      const birthdayDate = initialData.birthday 
        ? formatDateLocal(initialData.birthday)
        : "";
      
      setFormData({
        username: initialData.username || "",
        name: initialData.name || "",
        surname: initialData.surname || "",
        address: initialData.address || "",
        bloodType: initialData.bloodType || "",
        sex: initialData.sex || "MALE",
        schoolId,
        birthday: birthdayDate,
        email: initialData.email || "",
        phone: initialData.phone || "",
        img: initialData.img || "",
        subjectIds: initialData.subjects?.map((s: any) => s.id) || [],
      });
    } else if (isOpen && !initialData) {
      // Reset form for create mode
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
        subjectIds: [],
      });
      setErrors({});
    }
  }, [isOpen, initialData, schoolId]);

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
      
      if (isEditMode && onUpdate && initialData) {
        onUpdate(initialData.id, teacherData);
      } else {
        onCreate(teacherData);
        // Reset form only for create mode
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
          subjectIds: [],
        });
      }
      setErrors({});
      onClose();
    }
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Teacher" : "Create Teacher"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the teacher information below."
              : "Fill in the teacher information to create a new teacher record."}
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
                  className={errors.sex ? "border-red-500 w-full min-w-[200px]" : "w-full min-w-[200px]"}
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
                  className={errors.bloodType ? "border-red-500 w-full min-w-[200px]" : "w-full min-w-[200px]"}
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

            {/* Image URL */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <Input
                type="url"
                name="img"
                value={formData.img || ""}
                onChange={handleChange}
                placeholder="Enter image URL (optional)"
              />
              {formData.img && (
                <div className="mt-2">
                  <img
                    src={formData.img}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Subjects Multi-Select */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Subjects
              </label>
              <div className="relative">
                <Select
                  open={isSubjectDropdownOpen}
                  onOpenChange={setIsSubjectDropdownOpen}
                  onValueChange={(value) => {
                    const subjectId = Number(value);
                    if (!formData.subjectIds?.includes(subjectId)) {
                      setFormData((prev) => ({
                        ...prev,
                        subjectIds: [...(prev.subjectIds || []), subjectId],
                      }));
                    }
                    setIsSubjectDropdownOpen(false);
                  }}
                >
                  <SelectTrigger className="w-full min-w-[200px]">
                    <SelectValue placeholder="Select subjects to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects
                      .filter((subject: any) => !formData.subjectIds?.includes(subject.id))
                      .map((subject: any) => (
                        <SelectItem key={subject.id} value={String(subject.id)}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    {subjects.filter((subject: any) => !formData.subjectIds?.includes(subject.id)).length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-gray-500">All subjects selected</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selected Subjects as Chips */}
              {formData.subjectIds && formData.subjectIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.subjectIds.map((subjectId) => {
                    const subject = subjects.find((s: any) => s.id === subjectId);
                    return (
                      <div
                        key={subjectId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        <span>{subject?.name || `Subject ${subjectId}`}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              subjectIds: prev.subjectIds?.filter((id) => id !== subjectId) || [],
                            }));
                          }}
                          className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
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
              {isEditMode ? "Update Teacher" : "Create Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeacherModal;

