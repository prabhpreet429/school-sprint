"use client";

import { useSearchParams } from "next/navigation";
import Dashboard from "@/app/dashboard/page";
import { Card, CardContent } from "@/components/ui/card";
import { useGetDashboardDataQuery } from "@/state/api";

export default function Home() {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  
  // Require schoolId - no fallback
  if (!schoolIdParam) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500 text-center text-lg font-semibold">
              Access Denied
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);
  
  if (isNaN(schoolId)) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500 text-center text-lg font-semibold">
              Access Denied
            </p>
          </CardContent>
        </Card>
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
