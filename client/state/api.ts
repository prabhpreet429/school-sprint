import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Type definitions for Dashboard API
export interface SchoolDetails {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  country: string;
  timezone: string | null;
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

export interface Holiday {
  date: string;
  name: string;
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

export interface MonthlyAverage {
  month: string;
  present: number;
  absent: number;
}

export interface Student {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
  address: string;
  img: string | null;
  bloodType: string;
  sex: "MALE" | "FEMALE";
  createdAt: string;
  schoolId: number;
  classId: number;
  gradeId: number;
  birthday: string;
  school?: {
    id: number;
    name: string;
  };
  studentParents?: {
    relationship: "FATHER" | "MOTHER" | "GUARDIAN";
    parent: {
      id: number;
      name: string;
      surname: string;
    };
  }[];
  class?: {
    id: number;
    name: string;
  };
  grade?: {
    id: number;
    level: number;
  };
}

export interface Teacher {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
  address: string;
  img: string | null;
  bloodType: string;
  sex: "MALE" | "FEMALE";
  createdAt: string;
  schoolId: number;
  birthday: string;
  school?: {
    id: number;
    name: string;
  };
}

export interface Parent {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string | null;
  phone: string;
  address: string;
  createdAt: string;
  schoolId: number;
  school?: {
    id: number;
    name: string;
  };
}

export interface Grade {
  id: number;
  level: number;
  schoolId: number;
  _count?: {
    students: number;
    classess: number;
  };
}

export interface Class {
  id: number;
  name: string;
  capacity: number;
  schoolId: number;
  gradeId: number;
  supervisorId: number | null;
  grade?: {
    id: number;
    level: number;
  };
  supervisor?: {
    id: number;
    name: string;
    surname: string;
  } | null;
  _count?: {
    students: number;
    lessons: number;
  };
}

export interface DashboardData {
  schoolDetails: SchoolDetails | null;
  counts: {
    students: number;
    teachers: number;
    boys: number;
    girls: number;
  };
  upcomingEvents: UpcomingEvent[];
  holidays: Holiday[];
  attendance: {
    recentRecords: AttendanceRecord[];
    statistics: AttendanceStatistics;
    monthlyAverages: MonthlyAverage[];
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
  tagTypes: ["DashboardData", "Students", "Teachers", "Parents", "Grades", "Classes"],
  endpoints: (build) => ({
    // Get dashboard data by schoolId
    getDashboardData: build.query<DashboardResponse, number>({
      query: (schoolId) => `dashboard?schoolId=${schoolId}`,
      providesTags: ["DashboardData"],
    }),
    getStudents: build.query<{ success: boolean; data: Student[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/students',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Students"],
    }),
    createStudent: build.mutation<{ success: boolean; data: Student }, Partial<Student>>({
      query: (newStudent) => ({
        url: '/students',
        method: 'POST',
        body: newStudent,
      }),
      invalidatesTags: ["Students"],
    }),
    getTeachers: build.query<{ success: boolean; data: Teacher[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/teachers',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Teachers"],
    }),
    createTeacher: build.mutation<{ success: boolean; data: Teacher }, Partial<Teacher>>({
      query: (newTeacher) => ({
        url: '/teachers',
        method: 'POST',
        body: newTeacher,
      }),
      invalidatesTags: ["Teachers"],
    }),
    getParents: build.query<{ success: boolean; data: Parent[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/parents',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Parents"],
    }),
    createParent: build.mutation<{ success: boolean; data: Parent }, Partial<Parent>>({
      query: (newParent) => ({
        url: '/parents',
        method: 'POST',
        body: newParent,
      }),
      invalidatesTags: ["Parents"],
    }),
    getGrades: build.query<{ success: boolean; data: Grade[] }, { schoolId: number }>({
      query: ({ schoolId }) => ({
        url: '/grades',
        params: {
          schoolId,
        },
      }),
      providesTags: ["Grades"],
    }),
    createGrade: build.mutation<{ success: boolean; data: Grade }, Partial<Grade>>({
      query: (newGrade) => ({
        url: '/grades',
        method: 'POST',
        body: newGrade,
      }),
      invalidatesTags: ["Grades"],
    }),
    getClasses: build.query<{ success: boolean; data: Class[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/classes',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Classes"],
    }),
    createClass: build.mutation<{ success: boolean; data: Class }, Partial<Class>>({
      query: (newClass) => ({
        url: '/classes',
        method: 'POST',
        body: newClass,
      }),
      invalidatesTags: ["Classes"],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetStudentsQuery,
  useCreateStudentMutation,
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useGetParentsQuery,
  useCreateParentMutation,
  useGetGradesQuery,
  useCreateGradeMutation,
  useGetClassesQuery,
  useCreateClassMutation
} = api;