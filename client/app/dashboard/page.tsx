"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import UserCard from "./components/UserCard";
import CountChartContainer from "./components/CountChartContainer";
import AttendanceChartContainer from "./components/AttendanceChartContainer";
import EventCalendarContainer from "./components/EventCalendarContainer";
import EventsList from "./components/EventsList";
import Announcements from "./components/Announcements";
import FeesSummary from "./components/FeesSummary";
import { useGetDashboardDataQuery } from "@/state/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const schoolIdParam = searchParams?.get("schoolId");

  // Redirect students and teachers to their profile page
  useEffect(() => {
    if (user?.role === "student" && user.studentId && schoolIdParam) {
      router.replace(`/students/${user.studentId}?schoolId=${schoolIdParam}`);
    } else if (user?.role === "teacher" && user.teacherId && schoolIdParam) {
      router.replace(`/teachers/${user.teacherId}?schoolId=${schoolIdParam}`);
    }
  }, [user, schoolIdParam, router]);
  
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

  // Show loading while redirecting students or teachers
  if ((user?.role === "student" && user.studentId) || (user?.role === "teacher" && user.teacherId)) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const queryResult = useGetDashboardDataQuery(schoolId);
  const { data, error, isLoading, isFetching, status } = queryResult;

  // Show loading if: query is pending, loading, or fetching without data
  const shouldShowLoading = 
    status === 'pending' || 
    isLoading || 
    (isFetching && !data) ||
    (!data && status !== 'rejected');
  
  if (shouldShowLoading) {
    return (
      <div className="p-4 flex gap-4 flex-col md:flex-row">
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          <div className="flex gap-4 justify-between flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-4 flex-col lg:flex-row">
            <Skeleton className="w-full lg:w-1/3 h-[450px]" />
            <Skeleton className="w-full lg:w-2/3 h-[450px]" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
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

  const dashboardData = data?.data;

  // Check if school exists - if schoolDetails is null or data is missing, school doesn't exist
  if (!dashboardData || dashboardData.schoolDetails === null) {
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

  return (
    <div className="p-4 flex flex-col gap-6 relative">
      {isFetching && data && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/50 dark:bg-gray-900/50 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      )}
      
      {/* FIRST ROW: School Details, Students Count, Teacher Count */}
      <div className="flex gap-4 flex-col sm:flex-row sm:flex-nowrap items-stretch">
        <div className="flex-1 min-w-0 flex items-stretch">
          <UserCard 
            type="school" 
            schoolDetails={dashboardData.schoolDetails || undefined}
          />
        </div>
        <div className="flex items-stretch">
          <UserCard type="student" count={dashboardData.counts.students} />
        </div>
        <div className="flex items-stretch">
          <UserCard type="teacher" count={dashboardData.counts.teachers} />
        </div>
      </div>

      {/* SECOND ROW: Gender Distribution, Attendance, Calendar */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Gender Distribution Card */}
        <div className="w-full lg:w-1/3 h-[550px]">
          <CountChartContainer />
        </div>
        {/* Attendance Chart */}
        <div className="w-full lg:w-1/3 h-[550px]">
          <AttendanceChartContainer />
        </div>
        {/* Calendar */}
        <div className="w-full lg:w-1/3 h-[550px]">
          <EventCalendarContainer />
        </div>
      </div>

      {/* THIRD ROW: Fees Summary, Announcements, and Events */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 h-[400px]">
          <FeesSummary />
        </div>
        <div className="w-full lg:w-1/3 h-[400px]">
          <Announcements announcements={dashboardData?.announcements || []} />
        </div>
        <div className="w-full lg:w-1/3 h-[400px]">
          <EventsList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
