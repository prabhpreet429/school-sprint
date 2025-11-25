"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/app/dashboard/page";
import { Card, CardContent } from "@/components/ui/card";
import { useGetDashboardDataQuery } from "@/state/api";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Redirect to sign-up if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/sign-up");
    }
  }, [authLoading, isAuthenticated, router]);

  // Get schoolId from authenticated user
  useEffect(() => {
    const fetchUserSchoolId = async () => {
      if (isAuthenticated) {
        try {
          const user = await getCurrentUser();
          if (user?.schoolId) {
            setSchoolId(user.schoolId);
          } else {
            // If no schoolId, redirect to sign-up
            router.push("/sign-up");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          router.push("/sign-up");
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchUserSchoolId();
    }
  }, [isAuthenticated, router]);

  // Show loading while checking authentication or fetching user
  if (authLoading || isLoadingUser || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Wait for schoolId
  if (!schoolId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Fetch dashboard data at root level to show loading before Dashboard component renders
  const queryResult = useGetDashboardDataQuery(schoolId);
  const { data, isLoading, isFetching, status } = queryResult;

  // Show full-page loading spinner before Dashboard component renders
  // Show loading if: query is pending, loading, or fetching without data
  const shouldShowLoading = 
    status === 'pending' || 
    isLoading || 
    (isFetching && !data) ||
    (!data && status !== 'rejected');
  
  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
