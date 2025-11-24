"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Upload, X } from "lucide-react";

interface School {
  id: number;
  name: string;
  addressLine1?: string;
  state?: string;
  pinCode?: string;
  phone?: string;
  email?: string;
  country: string;
  timezone?: string;
  logo?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [schoolLoading, setSchoolLoading] = useState(true);
  const [school, setSchool] = useState<School | null>(null);

  // User settings
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");

  // School settings (admin only)
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolAddressLine1, setSchoolAddressLine1] = useState("");
  const [schoolState, setSchoolState] = useState("");
  const [schoolPinCode, setSchoolPinCode] = useState("");
  const [schoolCountry, setSchoolCountry] = useState("");
  const [schoolTimezone, setSchoolTimezone] = useState("UTC");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [schoolError, setSchoolError] = useState("");
  const [schoolSuccess, setSchoolSuccess] = useState("");

  // Fetch school data
  useEffect(() => {
    const fetchSchool = async () => {
      if (!user?.schoolId) {
        setSchoolLoading(false);
        return;
      }

      setSchoolLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/schools/${user.schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to fetch school:", errorData);
          setSchoolLoading(false);
          return;
        }

        const data = await response.json();
        console.log("School data received:", data);
        
        if (data.success && data.data) {
          const schoolData = data.data;
          setSchool(schoolData);
          // Populate form fields with existing school data
          setSchoolPhone(schoolData.phone || "");
          setSchoolAddressLine1(schoolData.addressLine1 || "");
          setSchoolState(schoolData.state || "");
          setSchoolPinCode(schoolData.pinCode || "");
          setSchoolCountry(schoolData.country || "");
          setSchoolTimezone(schoolData.timezone || "UTC");
          setSchoolLogo(schoolData.logo || null);
        } else {
          console.error("Invalid response format:", data);
        }
      } catch (error) {
        console.error("Error fetching school:", error);
      } finally {
        setSchoolLoading(false);
      }
    };

    fetchSchool();
  }, [user]);

  // Set initial username
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");
    setUserSuccess("");

    if (newPassword) {
      if (newPassword.length < 6) {
        setUserError("Password must be at least 6 characters");
        return;
      }

      if (newPassword !== confirmPassword) {
        setUserError("New passwords do not match");
        return;
      }

      if (!currentPassword) {
        setUserError("Current password is required to change password");
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: username !== user?.username ? username : undefined,
            currentPassword: newPassword ? currentPassword : undefined,
            newPassword: newPassword || undefined,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUserSuccess("Account updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Refresh user data
        window.location.reload();
      } else {
        setUserError(data.message || "Failed to update account");
      }
    } catch (error) {
      setUserError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolError("");
    setSchoolSuccess("");

    if (!schoolCountry) {
      setSchoolError("Country is required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/schools/${user?.schoolId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phone: schoolPhone || null,
            addressLine1: schoolAddressLine1 || null,
            state: schoolState || null,
            pinCode: schoolPinCode || null,
            country: schoolCountry,
            timezone: schoolTimezone || "UTC",
            logo: schoolLogo || null,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        const updatedSchool = data.data;
        setSchool(updatedSchool);
        // Update form fields with the updated data
        setSchoolPhone(updatedSchool.phone || "");
        setSchoolAddressLine1(updatedSchool.addressLine1 || "");
        setSchoolState(updatedSchool.state || "");
        setSchoolPinCode(updatedSchool.pinCode || "");
        setSchoolCountry(updatedSchool.country || "");
        setSchoolTimezone(updatedSchool.timezone || "UTC");
        setSchoolLogo(updatedSchool.logo || null);
        setSchoolSuccess("School information updated successfully!");
      } else {
        setSchoolError(data.message || "Failed to update school information");
      }
    } catch (error) {
      setSchoolError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSchoolError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSchoolError("Image size must be less than 5MB");
      return;
    }

    // Convert to base64 for now (in production, upload to cloud storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSchoolLogo(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSchoolLogo(null);
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account and school information
          </p>
        </div>

        {/* User Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Update your username and password
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password to change"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Required only if you want to change your password
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {userError && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {userError}
                </div>
              )}

              {userSuccess && (
                <div className="text-sm text-green-500 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  {userSuccess}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* School Settings (Admin Only) */}
        {user?.role === "admin" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>School Settings</CardTitle>
                  <CardDescription>
                    Update school information and logo (Admin only)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {schoolLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <form onSubmit={handleUpdateSchool} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      type="text"
                      value={school?.name || ""}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      School name cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolPhone">Phone</Label>
                    <Input
                      id="schoolPhone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={schoolPhone}
                      onChange={(e) => setSchoolPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="schoolAddressLine1">Address Line 1</Label>
                    <Input
                      id="schoolAddressLine1"
                      type="text"
                      placeholder="123 Education Street"
                      value={schoolAddressLine1}
                      onChange={(e) => setSchoolAddressLine1(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolState">State</Label>
                    <Input
                      id="schoolState"
                      type="text"
                      placeholder="State/Province"
                      value={schoolState}
                      onChange={(e) => setSchoolState(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolPinCode">Pin Code / ZIP</Label>
                    <Input
                      id="schoolPinCode"
                      type="text"
                      placeholder="12345"
                      value={schoolPinCode}
                      onChange={(e) => setSchoolPinCode(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolCountry">Country</Label>
                    <Input
                      id="schoolCountry"
                      type="text"
                      placeholder="United States"
                      value={schoolCountry}
                      onChange={(e) => setSchoolCountry(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolTimezone">Timezone</Label>
                    <Select
                      value={schoolTimezone}
                      onValueChange={setSchoolTimezone}
                      disabled={loading}
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
                        <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    School Logo
                  </h3>
                  {schoolLogo ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <img
                          src={schoolLogo}
                          alt="School Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveLogo}
                          disabled={loading}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Logo
                        </Button>
                        <Label
                          htmlFor="logo-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-center justify-center"
                        >
                          <Upload className="w-4 h-4" />
                          Change Logo
                        </Label>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <span className="text-gray-400 text-xs text-center px-2">No Logo</span>
                      </div>
                      <div>
                        <Label
                          htmlFor="logo-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Logo
                        </Label>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Upload a square image (recommended: 200x200px or larger). Max 5MB.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {schoolError && (
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    {schoolError}
                  </div>
                )}

                {schoolSuccess && (
                  <div className="text-sm text-green-500 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    {schoolSuccess}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update School Information"}
                  </Button>
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}

