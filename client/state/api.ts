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

export interface DashboardAnnouncement {
  id: number;
  title: string;
  description: string;
  date: string;
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

export interface Event {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  schoolId: number;
  classId: number | null;
  class?: {
    id: number;
    name: string;
    grade?: {
      id: number;
      level: number;
    };
  } | null;
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
  schoolId: number;
  classId: number | null;
  class?: {
    id: number;
    name: string;
    grade?: {
      id: number;
      level: number;
    };
  } | null;
}

export interface Subject {
  id: number;
  name: string;
  schoolId: number;
  _count?: {
    teachers: number;
    lessons: number;
  };
}

export interface Lesson {
  id: number;
  name: string;
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
  startTime: string;
  endTime: string;
  schoolId: number;
  subjectId: number;
  classId: number;
  teacherId: number;
  subject?: {
    id: number;
    name: string;
  };
  class?: {
    id: number;
    name: string;
    grade?: {
      id: number;
      level: number;
    };
  };
  teacher?: {
    id: number;
    name: string;
    surname: string;
  };
  _count?: {
    attendances: number;
    exams: number;
    assignments: number;
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
  announcements: DashboardAnnouncement[];
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
  tagTypes: ["DashboardData", "Students", "Teachers", "Parents", "Grades", "Classes", "Events", "Announcements", "Lessons", "Subjects"],
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
    updateStudent: build.mutation<{ success: boolean; data: Student }, { id: number; data: Partial<Student> }>({
      query: ({ id, data }) => ({
        url: `/students/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Students"],
    }),
    deleteStudent: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/students/${id}`,
        method: 'DELETE',
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
    updateTeacher: build.mutation<{ success: boolean; data: Teacher }, { id: number; data: Partial<Teacher> }>({
      query: ({ id, data }) => ({
        url: `/teachers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Teachers"],
    }),
    deleteTeacher: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: 'DELETE',
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
    updateParent: build.mutation<{ success: boolean; data: Parent }, { id: number; data: Partial<Parent> }>({
      query: ({ id, data }) => ({
        url: `/parents/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Parents"],
    }),
    deleteParent: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/parents/${id}`,
        method: 'DELETE',
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
    updateGrade: build.mutation<{ success: boolean; data: Grade }, { id: number; data: Partial<Grade> }>({
      query: ({ id, data }) => ({
        url: `/grades/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Grades"],
    }),
    deleteGrade: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/grades/${id}`,
        method: 'DELETE',
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
    updateClass: build.mutation<{ success: boolean; data: Class }, { id: number; data: Partial<Class> }>({
      query: ({ id, data }) => ({
        url: `/classes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Classes"],
    }),
    deleteClass: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/classes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Classes"],
    }),
    getEvents: build.query<{ success: boolean; data: Event[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/events',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Events"],
    }),
    createEvent: build.mutation<{ success: boolean; data: Event }, Partial<Event>>({
      query: (newEvent) => ({
        url: '/events',
        method: 'POST',
        body: newEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: build.mutation<{ success: boolean; data: Event }, { id: number; data: Partial<Event> }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteEvent: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Events"],
    }),
    getAnnouncements: build.query<{ success: boolean; data: Announcement[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/announcements',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Announcements"],
    }),
    createAnnouncement: build.mutation<{ success: boolean; data: Announcement }, Partial<Announcement>>({
      query: (newAnnouncement) => ({
        url: '/announcements',
        method: 'POST',
        body: newAnnouncement,
      }),
      invalidatesTags: ["Announcements"],
    }),
    updateAnnouncement: build.mutation<{ success: boolean; data: Announcement }, { id: number; data: Partial<Announcement> }>({
      query: ({ id, data }) => ({
        url: `/announcements/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Announcements"],
    }),
    deleteAnnouncement: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Announcements"],
    }),
    getSubjects: build.query<{ success: boolean; data: Subject[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/subjects',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Subjects"],
    }),
    getLessons: build.query<{ success: boolean; data: Lesson[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/lessons',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Lessons"],
    }),
    createLesson: build.mutation<{ success: boolean; data: Lesson }, Partial<Lesson>>({
      query: (newLesson) => ({
        url: '/lessons',
        method: 'POST',
        body: newLesson,
      }),
      invalidatesTags: ["Lessons"],
    }),
    updateLesson: build.mutation<{ success: boolean; data: Lesson }, { id: number; data: Partial<Lesson> }>({
      query: ({ id, data }) => ({
        url: `/lessons/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Lessons"],
    }),
    deleteLesson: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Lessons"],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetParentsQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
  useGetGradesQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetSubjectsQuery,
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation
} = api;