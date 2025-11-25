"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Dashboard from "@/app/dashboard/page";
import { useGetDashboardDataQuery } from "@/state/api";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Try to get schoolId from URL first, otherwise will get from user
  const schoolIdParam = searchParams?.get("schoolId");
  const [schoolId, setSchoolId] = useState<number | null>(
    schoolIdParam ? parseInt(schoolIdParam, 10) : null
  );
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch dashboard data at root level - ALWAYS call hook before any conditional returns
  // Use skip option to prevent query when schoolId is not available
  const queryResult = useGetDashboardDataQuery(schoolId || 0, {
    skip: !schoolId, // Skip the query if schoolId is not available
  });
  const { data, isLoading, isFetching, status } = queryResult;

  // Update schoolId if URL changes
  useEffect(() => {
    if (schoolIdParam) {
      const parsedId = parseInt(schoolIdParam, 10);
      if (!isNaN(parsedId) && parsedId !== schoolId) {
        setSchoolId(parsedId);
      }
    }
  }, [schoolIdParam, schoolId]);

  // Redirect to sign-up if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/sign-up");
    }
  }, [authLoading, isAuthenticated, router]);

  // Get schoolId from authenticated user if not in URL
  useEffect(() => {
    const fetchUserSchoolId = async () => {
      if (isAuthenticated && !schoolIdParam) {
        // Only fetch from user if schoolId is not in URL
        try {
          const user = await getCurrentUser();
          if (user?.schoolId) {
            setSchoolId(user.schoolId);
            // Update URL to include schoolId
            router.replace(`/?schoolId=${user.schoolId}`, { scroll: false });
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
      } else {
        // schoolId is in URL or not authenticated yet
        setIsLoadingUser(false);
      }
    };

    if (isAuthenticated) {
      fetchUserSchoolId();
    } else if (!authLoading) {
      setIsLoadingUser(false);
    }
  }, [isAuthenticated, router, schoolIdParam, authLoading]);

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
