"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createAccount } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CreateAccountPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const schoolId = user?.schoolId || parseInt(searchParams?.get("schoolId") || "1");

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Only admins can create accounts.
          </p>
        </div>
      </div>
    );
  }

  const [personType, setPersonType] = useState<"teacher" | "student">("teacher");
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch people without accounts from backend
  const [availablePeople, setAvailablePeople] = useState<any[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  useEffect(() => {
    const fetchPeopleWithoutAccounts = async () => {
      if (!schoolId) return;
      
      setLoadingPeople(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/people-without-accounts?personType=${personType}&schoolId=${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Filter by search term if provided
          if (searchTerm) {
            const filtered = (data.data || []).filter((person: any) =>
              `${person.name} ${person.surname} ${person.username}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setAvailablePeople(filtered);
          } else {
            setAvailablePeople(data.data || []);
          }
        } else {
          setAvailablePeople([]);
        }
      } catch (error) {
        console.error("Error fetching people:", error);
        setAvailablePeople([]);
      } finally {
        setLoadingPeople(false);
      }
    };

    fetchPeopleWithoutAccounts();
  }, [personType, schoolId, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedPersonId) {
      setError("Please select a person");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createAccount(
        email,
        password,
        personType,
        parseInt(selectedPersonId),
        schoolId
      );

      if (result.success) {
        setSuccess(result.message || "Account created successfully!");
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setSelectedPersonId("");
      } else {
        setError(result.message || "Failed to create account");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPerson = availablePeople.find(
    (p: any) => p.id === parseInt(selectedPersonId)
  );

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="p-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Create login accounts for existing teachers or students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Person Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="personType">Person Type</Label>
                <Select
                  value={personType}
                  onValueChange={(value) => {
                    setPersonType(value as "teacher" | "student");
                    setSelectedPersonId("");
                    setSearchTerm("");
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className="min-w-[200px]">
                    <SelectValue placeholder="Select person type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search {personType}s</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder={`Search ${personType}s by name...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Person Selection */}
              <div className="space-y-2">
                <Label htmlFor="person">Select {personType}</Label>
                {loadingPeople ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    Loading {personType}s...
                  </div>
                ) : availablePeople.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    No {personType}s without accounts found
                  </div>
                ) : (
                  <Select
                    value={selectedPersonId}
                    onValueChange={setSelectedPersonId}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="min-w-[200px]">
                      <SelectValue placeholder={`Select a ${personType}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePeople.map((person: any) => (
                        <SelectItem key={person.id} value={String(person.id)}>
                          {person.name} {person.surname} ({person.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedPerson && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Selected: {selectedPerson.name} {selectedPerson.surname}
                    {selectedPerson.email && ` - ${selectedPerson.email}`}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-green-500 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading || !selectedPersonId}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

