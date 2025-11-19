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

type ParentFormData = {
  username: string;
  name: string;
  surname: string;
  address: string;
  phone: string;
  email?: string;
  relationship: "FATHER" | "MOTHER" | "GUARDIAN";
};

type StudentFormData = {
  username: string;
  name: string;
  surname: string;
  address: string;
  bloodType: string;
  sex: "MALE" | "FEMALE";
  schoolId: number;
  parents: ParentFormData[]; // Array of parents with relationship
  classId: number;
  gradeId: number;
  birthday: string;
  email?: string;
  phone?: string;
  img?: string;
};

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (studentData: StudentFormData) => void;
  schoolId: number;
}

const CreateStudentModal = ({
  isOpen,
  onClose,
  onCreate,
  schoolId,
}: CreateStudentModalProps) => {
  const [formData, setFormData] = useState<StudentFormData>({
    username: "",
    name: "",
    surname: "",
    address: "",
    bloodType: "",
    sex: "MALE",
    schoolId,
    parents: [
      {
        username: "",
        name: "",
        surname: "",
        address: "",
        phone: "",
        email: "",
        relationship: "MOTHER",
      },
    ],
    classId: 0,
    gradeId: 0,
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

  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      parents: prev.parents.map((parent, i) =>
        i === index ? { ...parent, [name]: value } : parent
      ),
    }));
    // Clear error when user starts typing
    const errorKey = `parents.${index}.${name}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleParentRelationshipChange = (index: number, relationship: "FATHER" | "MOTHER" | "GUARDIAN") => {
    setFormData((prev) => ({
      ...prev,
      parents: prev.parents.map((parent, i) =>
        i === index ? { ...parent, relationship } : parent
      ),
    }));
  };

  const addParent = () => {
    setFormData((prev) => ({
      ...prev,
      parents: [
        ...prev.parents,
        {
          username: "",
          name: "",
          surname: "",
          address: "",
          phone: "",
          email: "",
          relationship: "GUARDIAN",
        },
      ],
    }));
  };

  const removeParent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      parents: prev.parents.filter((_, i) => i !== index),
    }));
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
    if (!formData.classId || formData.classId === 0) {
      newErrors.classId = "Class is required";
    }
    if (!formData.gradeId || formData.gradeId === 0) {
      newErrors.gradeId = "Grade is required";
    }
    if (!formData.birthday) {
      newErrors.birthday = "Birthday is required";
    }
    // Validate parents array
    if (!formData.parents || formData.parents.length === 0) {
      newErrors["parents"] = "At least one parent must be provided";
    } else {
      formData.parents.forEach((parent, index) => {
        if (!parent.username?.trim()) {
          newErrors[`parents.${index}.username`] = "Parent username is required";
        }
        if (!parent.name?.trim()) {
          newErrors[`parents.${index}.name`] = "Parent name is required";
        }
        if (!parent.surname?.trim()) {
          newErrors[`parents.${index}.surname`] = "Parent surname is required";
        }
        if (!parent.address?.trim()) {
          newErrors[`parents.${index}.address`] = "Parent address is required";
        }
        if (!parent.phone?.trim()) {
          newErrors[`parents.${index}.phone`] = "Parent phone is required";
        }
        if (!parent.relationship) {
          newErrors[`parents.${index}.relationship`] = "Parent relationship is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert numeric fields to numbers and prepare parent data
      const studentData: StudentFormData = {
        ...formData,
        classId: Number(formData.classId),
        gradeId: Number(formData.gradeId),
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        img: formData.img || undefined,
        parents: formData.parents.filter(
          (parent) => parent.username?.trim() || parent.name?.trim()
        ).map((parent) => ({
          username: parent.username,
          name: parent.name,
          surname: parent.surname,
          address: parent.address,
          phone: parent.phone,
          email: parent.email || undefined,
          relationship: parent.relationship,
        })),
      };
      onCreate(studentData);
      // Reset form
      setFormData({
        username: "",
        name: "",
        surname: "",
        address: "",
        bloodType: "",
        sex: "MALE",
        schoolId,
        parents: [
          {
            username: "",
            name: "",
            surname: "",
            address: "",
            phone: "",
            email: "",
            relationship: "MOTHER",
          },
        ],
        classId: 0,
        gradeId: 0,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Student</DialogTitle>
          <DialogDescription>
            Fill in the student information to create a new student record.
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

            {/* Class ID */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Class ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="classId"
                value={formData.classId || ""}
                onChange={(e) =>
                  handleSelectChange("classId", e.target.value)
                }
                placeholder="Enter class ID"
                className={errors.classId ? "border-red-500" : ""}
              />
              {errors.classId && (
                <p className="text-red-500 text-xs mt-1">{errors.classId}</p>
              )}
            </div>

            {/* Grade ID */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Grade ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="gradeId"
                value={formData.gradeId || ""}
                onChange={(e) =>
                  handleSelectChange("gradeId", e.target.value)
                }
                placeholder="Enter grade ID"
                className={errors.gradeId ? "border-red-500" : ""}
              />
              {errors.gradeId && (
                <p className="text-red-500 text-xs mt-1">{errors.gradeId}</p>
              )}
            </div>

            {/* Parents Information Section */}
            <div className="col-span-2 border-t pt-4 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Parent Information</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addParent}
                  className="cursor-pointer"
                >
                  + Add Parent
                </Button>
              </div>

              {formData.parents.map((parent, index) => (
                <div key={index} className="mb-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Parent {index + 1}</h4>
                    {formData.parents.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeParent(index)}
                        className="cursor-pointer text-red-500"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Relationship */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Relationship <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={parent.relationship}
                        onValueChange={(value) =>
                          handleParentRelationshipChange(
                            index,
                            value as "FATHER" | "MOTHER" | "GUARDIAN"
                          )
                        }
                      >
                        <SelectTrigger
                          className={
                            errors[`parents.${index}.relationship`]
                              ? "border-red-500"
                              : "w-full"
                          }
                        >
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FATHER">Father</SelectItem>
                          <SelectItem value="MOTHER">Mother</SelectItem>
                          <SelectItem value="GUARDIAN">Guardian</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors[`parents.${index}.relationship`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`parents.${index}.relationship`]}
                        </p>
                      )}
                    </div>

                    {/* Parent Username */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="username"
                        value={parent.username}
                        onChange={(e) => handleParentChange(e, index)}
                        placeholder="Enter parent username"
                        className={
                          errors[`parents.${index}.username`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`parents.${index}.username`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`parents.${index}.username`]}
                        </p>
                      )}
                    </div>

                    {/* Parent Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="name"
                        value={parent.name}
                        onChange={(e) => handleParentChange(e, index)}
                        placeholder="Enter parent first name"
                        className={
                          errors[`parents.${index}.name`] ? "border-red-500" : ""
                        }
                      />
                      {errors[`parents.${index}.name`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`parents.${index}.name`]}
                        </p>
                      )}
                    </div>

                    {/* Parent Surname */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="surname"
                        value={parent.surname}
                        onChange={(e) => handleParentChange(e, index)}
                        placeholder="Enter parent last name"
                        className={
                          errors[`parents.${index}.surname`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`parents.${index}.surname`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`parents.${index}.surname`]}
                        </p>
                      )}
                    </div>

                    {/* Parent Email */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={parent.email || ""}
                        onChange={(e) => handleParentChange(e, index)}
                        placeholder="Enter parent email (optional)"
                      />
                    </div>

                    {/* Parent Phone */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={parent.phone}
                        onChange={(e) => handleParentChange(e, index)}
                        placeholder="Enter parent phone"
                        className={
                          errors[`parents.${index}.phone`] ? "border-red-500" : ""
                        }
                      />
                      {errors[`parents.${index}.phone`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`parents.${index}.phone`]}
                        </p>
                      )}
                    </div>

                    {/* Parent Address */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="address"
                        value={parent.address}
                        onChange={(e) => handleParentChange(e, index)}
                        placeholder="Enter parent address"
                        className={
                          errors[`parents.${index}.address`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`parents.${index}.address`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`parents.${index}.address`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {errors["parents"] && (
                <p className="text-red-500 text-xs mt-1">{errors["parents"]}</p>
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
              Create Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudentModal;

