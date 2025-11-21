"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface School {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  country: string;
  timezone?: string;
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const schoolIdParam = searchParams?.get("schoolId");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const [isLoadingSchool, setIsLoadingSchool] = useState(false);

  // Validate schoolId
  const schoolId = schoolIdParam ? parseInt(schoolIdParam, 10) : null;
  const isValidSchoolId = schoolId !== null && !isNaN(schoolId) && schoolId > 0;

  // Show forbidden page if schoolId is missing or invalid
  if (!schoolIdParam || !isValidSchoolId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Access Forbidden</CardTitle>
            <CardDescription className="text-base">
              {!schoolIdParam 
                ? "School ID is required to sign in"
                : "Invalid School ID provided"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                {!schoolIdParam 
                  ? "You must provide a school ID in the URL to access the sign-in page."
                  : "The school ID must be a valid positive number."}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Example: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/sign-in?schoolId=1</code>
              </p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <Button
                onClick={() => router.push("/sign-up")}
                variant="outline"
                className="w-full"
              >
                Go to Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const fetchSchool = async () => {
      if (!isValidSchoolId || !schoolId) return;

      setIsLoadingSchool(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
        const response = await fetch(`${apiBaseUrl}/api/schools/${schoolId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setSchool(data.data);
        }
      } catch (error) {
        console.error("Error fetching school:", error);
      } finally {
        setIsLoadingSchool(false);
      }
    };

    fetchSchool();
  }, [schoolId, isValidSchoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message || "Invalid email or password");
        setIsLoading(false);
      } else {
        // Get user info to redirect with schoolId
        const { getCurrentUser } = await import("@/lib/auth");
        const user = await getCurrentUser();
        const schoolId = user?.schoolId || 1;
        
        // Redirect to callback URL or dashboard
        const url = callbackUrl === "/" ? `/?schoolId=${schoolId}` : callbackUrl;
        router.push(url);
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            {school ? (
              <>
                Sign in to <span className="font-semibold">{school.name}</span>
              </>
            ) : schoolIdParam ? (
              isLoadingSchool ? (
                "Loading school information..."
              ) : (
                "Enter your credentials to access your account"
              )
            ) : (
              "Enter your credentials to access your account"
            )}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
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
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm">
              <a href="/sign-up" className="text-primary hover:underline">
                Don't have an account? Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
