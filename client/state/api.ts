import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Type definitions for Dashboard API
export interface SchoolDetails {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  className: string | null;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  present: boolean;
  student: {
    id: number;
    name: string;
  };
  lesson: {
    id: number;
    name: string;
  };
}

export interface AttendanceStatistics {
  totalRecords: number;
  present: number;
  absent: number;
  attendanceRate: number;
}

export interface DashboardData {
  schoolDetails: SchoolDetails | null;
  counts: {
    students: number;
    teachers: number;
  };
  upcomingEvents: UpcomingEvent[];
  attendance: {
    recentRecords: AttendanceRecord[];
    statistics: AttendanceStatistics;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
  error?: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  }),
  reducerPath: "api",
  tagTypes: ["DashboardData"],
  endpoints: (build) => ({
    // Get dashboard data by schoolId
    getDashboardData: build.query<DashboardResponse, number>({
      query: (schoolId) => `dashboard?schoolId=${schoolId}`,
      providesTags: ["DashboardData"],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
} = api;