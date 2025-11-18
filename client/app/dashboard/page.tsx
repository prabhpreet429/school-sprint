"use client";

import { useSearchParams } from "next/navigation";
import UserCard from "./components/UserCard";
import CountChartContainer from "./components/CountChartContainer";
import AttendanceChartContainer from "./components/AttendanceChartContainer";
import EventCalendarContainer from "./components/EventCalendarContainer";
import Announcements from "./components/Announcements";
import { useGetDashboardDataQuery } from "@/state/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
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

  const { data, error, isLoading } = useGetDashboardDataQuery(schoolId);

  if (isLoading) {
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
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-nowrap">
          <UserCard 
            type="school" 
            schoolDetails={dashboardData.schoolDetails || undefined}
          />
          <UserCard type="student" count={dashboardData.counts.students} />
          <UserCard type="teacher" count={dashboardData.counts.teachers} />
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer />
        <Announcements />
      </div>
    </div>
  );
};

export default Dashboard;
