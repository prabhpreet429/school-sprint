"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export default function SignUpPage() {
  const router = useRouter();
  const { register, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    schoolName: "",
    schoolAddressLine1: "",
    schoolState: "",
    schoolPinCode: "",
    schoolCountry: "",
    schoolPhone: "",
    schoolTimezone: "UTC",
    role: "admin", // Only admin can be created via public sign-up
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.schoolName || !formData.schoolCountry) {
      setError("School name and country are required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.username,
        formData.schoolName,
        formData.schoolAddressLine1,
        formData.schoolState,
        formData.schoolPinCode,
        formData.schoolCountry,
        formData.schoolPhone,
        formData.schoolTimezone,
        formData.role
      );

      if (!result.success) {
        setError(result.message || "Registration failed");
        setIsLoading(false);
      } else {
        // Wait a moment for AuthContext to update with the user
        // Then redirect to dashboard with schoolId in URL
        setTimeout(async () => {
          const { getCurrentUser } = await import("@/lib/auth");
          const user = await getCurrentUser();
          if (user?.schoolId) {
            router.push(`/dashboard?schoolId=${user.schoolId}`);
            router.refresh();
          } else {
            router.push("/dashboard");
            router.refresh();
          }
        }, 100);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Register a new admin account for your school
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@school.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                type="text"
                placeholder="Springfield Elementary School"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolAddressLine1">School Address Line 1</Label>
              <Input
                id="schoolAddressLine1"
                type="text"
                placeholder="123 Education Street"
                value={formData.schoolAddressLine1}
                onChange={(e) => setFormData({ ...formData, schoolAddressLine1: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolState">State/Province</Label>
                <Input
                  id="schoolState"
                  type="text"
                  placeholder="California"
                  value={formData.schoolState}
                  onChange={(e) => setFormData({ ...formData, schoolState: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolPinCode">Pin Code / ZIP Code</Label>
                <Input
                  id="schoolPinCode"
                  type="text"
                  placeholder="12345"
                  value={formData.schoolPinCode}
                  onChange={(e) => setFormData({ ...formData, schoolPinCode: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolCountry">Country</Label>
              <Input
                id="schoolCountry"
                type="text"
                placeholder="United States"
                value={formData.schoolCountry}
                onChange={(e) => setFormData({ ...formData, schoolCountry: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolPhone">School Phone</Label>
              <Input
                id="schoolPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.schoolPhone}
                onChange={(e) => setFormData({ ...formData, schoolPhone: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolTimezone">Timezone</Label>
              <Select
                value={formData.schoolTimezone}
                onValueChange={(value) => setFormData({ ...formData, schoolTimezone: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (Eastern Time)</SelectItem>
                  <SelectItem value="America/Chicago">America/Chicago (Central Time)</SelectItem>
                  <SelectItem value="America/Denver">America/Denver (Mountain Time)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles (Pacific Time)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Asia/Shanghai (CST)</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST - Indian Standard Time)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                type="text"
                value="Admin"
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ℹ️ Only admin accounts can be created here. Teachers and students must have their accounts created by an admin from the dashboard.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm">
              <a href="/sign-in" className="text-primary hover:underline cursor-pointer">
                Already have an account? Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
