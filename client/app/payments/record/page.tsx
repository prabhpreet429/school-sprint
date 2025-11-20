"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetClassesQuery, useGetStudentsQuery, useCreatePaymentMutation } from "@/state/api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Header from "@/app/(components)/Header";

type PaymentDetails = {
  amount: number;
  enabled: boolean;
  paymentMethod: "CASH" | "CARD" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";
  referenceNumber: string;
  notes: string;
};

const RecordPaymentsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const schoolIdParam = searchParams?.get("schoolId");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [studentPayments, setStudentPayments] = useState<Record<number, PaymentDetails>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!schoolIdParam) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);

  if (isNaN(schoolId)) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  // Set default date to today
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    }
  }, [selectedDate]);

  const { data: classesData } = useGetClassesQuery({ schoolId, search: "" });
  const { data: studentsData } = useGetStudentsQuery({ schoolId, search: "" });
  const [createPayment] = useCreatePaymentMutation();

  const classes = classesData?.data || [];
  const allStudents = studentsData?.data || [];

  // Filter students by selected class (memoized to prevent infinite loops)
  const classStudents = useMemo(() => {
    return selectedClassId
      ? allStudents.filter((student: any) => student.classId === selectedClassId)
      : [];
  }, [selectedClassId, allStudents]);

  // Create a stable key for the class students to use as dependency
  const classStudentsKey = useMemo(() => {
    if (!selectedClassId || classStudents.length === 0) return null;
    return `${selectedClassId}-${classStudents.map((s: any) => s.id).sort().join(',')}`;
  }, [selectedClassId, classStudents]);

  // Initialize student payments when class changes
  useEffect(() => {
    if (selectedClassId && classStudents.length > 0) {
      const initialPayments: Record<number, PaymentDetails> = {};
      classStudents.forEach((student: any) => {
        initialPayments[student.id] = {
          amount: 0,
          enabled: false,
          paymentMethod: "CASH",
          referenceNumber: "",
          notes: "",
        };
      });
      setStudentPayments(initialPayments);
    } else if (!selectedClassId) {
      setStudentPayments({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classStudentsKey]);

  const handlePaymentChange = (studentId: number, field: keyof PaymentDetails, value: any) => {
    setStudentPayments((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSelectAll = () => {
    const allEnabled = Object.values(studentPayments).every((p) => p.enabled);
    const newPayments: Record<number, PaymentDetails> = {};
    classStudents.forEach((student: any) => {
      newPayments[student.id] = {
        ...studentPayments[student.id],
        enabled: !allEnabled,
      };
    });
    setStudentPayments(newPayments);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedDate) {
      newErrors.date = "Date is required";
    }
    if (!selectedClassId) {
      newErrors.classId = "Class is required";
    }

    // Check if at least one student has payment enabled
    const hasEnabledPayments = Object.values(studentPayments).some((p) => p.enabled);
    if (!hasEnabledPayments) {
      newErrors.students = "At least one student payment must be enabled";
    }

    // Check if all enabled payments have valid amounts
    for (const [studentId, payment] of Object.entries(studentPayments)) {
      if (payment.enabled && payment.amount <= 0) {
        newErrors[`student_${studentId}`] = "Amount must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentPromises: Promise<any>[] = [];

      for (const [studentId, payment] of Object.entries(studentPayments)) {
        if (payment.enabled && payment.amount > 0) {
          paymentPromises.push(
            createPayment({
              studentId: parseInt(studentId, 10),
              amount: payment.amount,
              paymentDate: selectedDate,
              paymentMethod: payment.paymentMethod,
              referenceNumber: payment.referenceNumber || undefined,
              notes: payment.notes || undefined,
              schoolId,
            }).unwrap()
          );
        }
      }

      await Promise.all(paymentPromises);

      router.push(`/payments?schoolId=${schoolId}`);
    } catch (error) {
      console.error("Failed to record payments:", error);
      alert("Failed to record payments. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClass = classes.find((c: any) => c.id === selectedClassId);

  return (
    <div className="p-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/payments?schoolId=${schoolId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <Header name="Record Payments" />
      </div>

      {/* Form Container */}
      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            {/* Class Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedClassId ? String(selectedClassId) : ""}
                onValueChange={(value) => {
                  setSelectedClassId(value ? parseInt(value, 10) : null);
                }}
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
              {selectedClass && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {classStudents.length} student{classStudents.length !== 1 ? 's' : ''} in this class
                </p>
              )}
            </div>
          </div>

          {/* Students List */}
          {selectedClassId && classStudents.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Students</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSelectAll}
                  className="cursor-pointer"
                >
                  {Object.values(studentPayments).every((p) => p.enabled) ? "Deselect All" : "Select All"}
                </Button>
              </div>
              {errors.students && (
                <p className="text-red-500 text-xs mb-4">{errors.students}</p>
              )}
              <div className="space-y-4">
                {classStudents.map((student: any) => {
                  const payment = studentPayments[student.id] || {
                    amount: 0,
                    enabled: false,
                    paymentMethod: "CASH" as const,
                    referenceNumber: "",
                    notes: "",
                  };
                  return (
                    <div
                      key={student.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={payment.enabled}
                          onChange={(e) =>
                            handlePaymentChange(student.id, "enabled", e.target.checked)
                          }
                          className="w-4 h-4 mt-2 cursor-pointer"
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Student Info */}
                          <div>
                            <div className="font-medium mb-1">
                              {student.name} {student.surname}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {student.username}
                            </div>
                          </div>

                          {/* Amount */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">$</span>
                              <Input
                                type="number"
                                value={payment.amount || ""}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    student.id,
                                    "amount",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                disabled={!payment.enabled}
                                className={errors[`student_${student.id}`] ? "border-red-500" : ""}
                              />
                            </div>
                            {errors[`student_${student.id}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`student_${student.id}`]}
                              </p>
                            )}
                          </div>

                          {/* Payment Method */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Payment Method <span className="text-red-500">*</span>
                            </label>
                            <Select
                              value={payment.paymentMethod}
                              onValueChange={(value) =>
                                handlePaymentChange(student.id, "paymentMethod", value)
                              }
                              disabled={!payment.enabled}
                            >
                              <SelectTrigger className="min-w-[150px]">
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="CARD">Card</SelectItem>
                                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Reference Number */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Reference Number
                            </label>
                            <Input
                              type="text"
                              value={payment.referenceNumber}
                              onChange={(e) =>
                                handlePaymentChange(student.id, "referenceNumber", e.target.value)
                              }
                              placeholder="Optional"
                              disabled={!payment.enabled}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes Row */}
                      <div className="mt-4 ml-8">
                        <label className="block text-sm font-medium mb-1">
                          Notes
                        </label>
                        <Input
                          type="text"
                          value={payment.notes}
                          onChange={(e) =>
                            handlePaymentChange(student.id, "notes", e.target.value)
                          }
                          placeholder="Optional notes"
                          disabled={!payment.enabled}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Link href={`/payments?schoolId=${schoolId}`}>
              <Button type="button" variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Payments"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentsPage;
