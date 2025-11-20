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
      username: string;
      name: string;
      surname: string;
      email: string | null;
      phone: string | null;
      address: string;
    };
  }[];
  class?: {
    id: number;
    name: string;
    grade?: {
      id: number;
      level: number;
    };
    _count?: {
      students: number;
    };
  };
  grade?: {
    id: number;
    level: number;
  };
  attendances?: {
    id: number;
    date: string;
    present: boolean;
    lesson?: {
      id: number;
      name: string;
      subject?: {
        id: number;
        name: string;
      };
    };
  }[];
  results?: {
    id: number;
    score: number;
    exam?: {
      id: number;
      title: string;
      lesson?: {
        id: number;
        name: string;
        subject?: {
          id: number;
          name: string;
        };
      };
    };
    assignment?: {
      id: number;
      title: string;
      lesson?: {
        id: number;
        name: string;
        subject?: {
          id: number;
          name: string;
        };
      };
    };
  }[];
  _count?: {
    attendances: number;
    results: number;
    studentParents: number;
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
  subjects?: {
    id: number;
    name: string;
  }[];
  classes?: {
    id: number;
    name: string;
    grade?: {
      id: number;
      level: number;
    };
    _count?: {
      students: number;
    };
  }[];
  lessons?: {
    id: number;
    name: string;
    day: string;
    startTime: string;
    endTime: string;
    subject?: {
      id: number;
      name: string;
    };
    class?: {
      id: number;
      name: string;
    };
  }[];
  _count?: {
    lessons: number;
    classes: number;
    subjects: number;
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
  teachers?: {
    id: number;
    name: string;
    surname: string;
  }[];
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

export interface Exam {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  schoolId: number;
  lessonId: number;
  lesson?: {
    id: number;
    name: string;
    subject?: {
      id: number;
      name: string;
    };
    class?: {
      id: number;
      name: string;
    };
  };
  _count?: {
    results: number;
  };
}

export interface Attendance {
  id: number;
  date: string;
  present: boolean;
  schoolId: number;
  studentId: number;
  lessonId: number;
  student?: {
    id: number;
    name: string;
    surname: string;
    username: string;
    class?: {
      id: number;
      name: string;
    };
  };
  lesson?: {
    id: number;
    name: string;
    subject?: {
      id: number;
      name: string;
    };
    class?: {
      id: number;
      name: string;
    };
  };
}

export interface Assignment {
  id: number;
  title: string;
  startDate: string;
  dueDate: string;
  schoolId: number;
  lessonId: number;
  lesson?: {
    id: number;
    name: string;
    subject?: {
      id: number;
      name: string;
    };
    class?: {
      id: number;
      name: string;
    };
    teacher?: {
      id: number;
      name: string;
      surname: string;
    };
  };
  _count?: {
    results: number;
  };
}

export interface Fee {
  id: number;
  name: string;
  amount: number;
  frequency: "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  schoolId: number;
  gradeId: number | null;
  grade?: {
    id: number;
    level: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    studentFees: number;
  };
}

export interface StudentFee {
  id: number;
  studentId: number;
  feeId: number;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "WAIVED";
  paidAmount: number;
  schoolId: number;
  academicYear: string | null;
  term: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    name: string;
    surname: string;
    username: string;
    class?: {
      id: number;
      name: string;
    };
    grade?: {
      id: number;
      level: number;
    };
  };
  fee?: {
    id: number;
    name: string;
    frequency: string;
  };
}

export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: "CASH" | "CARD" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";
  referenceNumber: string | null;
  notes: string | null;
  schoolId: number;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    name: string;
    surname: string;
    username: string;
    class?: {
      id: number;
      name: string;
    };
  };
  feePayments?: {
    id: number;
    amount: number;
    studentFee: {
      id: number;
      fee: {
        id: number;
        name: string;
      };
    };
  }[];
}

export interface Result {
  id: number;
  score: number;
  schoolId: number;
  studentId: number;
  examId: number | null;
  assignmentId: number | null;
  student?: {
    id: number;
    name: string;
    surname: string;
    class?: {
      id: number;
      name: string;
    };
  };
  exam?: {
    id: number;
    title: string;
    lesson?: {
      id: number;
      name: string;
      subject?: {
        id: number;
        name: string;
      };
    };
  } | null;
  assignment?: {
    id: number;
    title: string;
    lesson?: {
      id: number;
      name: string;
      subject?: {
        id: number;
        name: string;
      };
    };
  } | null;
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
  fees: {
    totalDue: number;
    totalPaid: number;
    totalPending: number;
    collectionRate: number;
    paymentsThisMonth: number;
    paymentsThisYear: number;
    overdueCount: number;
    pendingCount: number;
    monthlyCollection: Array<{ month: string; amount: number }>;
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
  tagTypes: ["DashboardData", "Students", "Teachers", "Parents", "Grades", "Classes", "Events", "Announcements", "Lessons", "Subjects", "Exams", "Results", "Attendances", "Assignments", "Fees", "StudentFees", "Payments"],
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
    getStudentById: build.query<{ success: boolean; data: Student }, { id: number; schoolId: number }>({
      query: ({ id, schoolId }) => ({
        url: `/students/${id}`,
        params: {
          schoolId,
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
    getTeacherById: build.query<{ success: boolean; data: Teacher }, { id: number; schoolId: number }>({
      query: ({ id, schoolId }) => ({
        url: `/teachers/${id}`,
        params: {
          schoolId,
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
    createSubject: build.mutation<{ success: boolean; data: Subject }, Partial<Subject>>({
      query: (newSubject) => ({
        url: '/subjects',
        method: 'POST',
        body: newSubject,
      }),
      invalidatesTags: ["Subjects"],
    }),
    updateSubject: build.mutation<{ success: boolean; data: Subject }, { id: number; data: Partial<Subject> }>({
      query: ({ id, data }) => ({
        url: `/subjects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Subjects"],
    }),
    deleteSubject: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Subjects"],
    }),
    getExams: build.query<{ success: boolean; data: Exam[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/exams',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Exams"],
    }),
    createExam: build.mutation<{ success: boolean; data: Exam }, Partial<Exam>>({
      query: (newExam) => ({
        url: '/exams',
        method: 'POST',
        body: newExam,
      }),
      invalidatesTags: ["Exams"],
    }),
    updateExam: build.mutation<{ success: boolean; data: Exam }, { id: number; data: Partial<Exam> }>({
      query: ({ id, data }) => ({
        url: `/exams/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Exams"],
    }),
    deleteExam: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/exams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Exams"],
    }),
    getResults: build.query<{ success: boolean; data: Result[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/results',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Results"],
    }),
    createResult: build.mutation<{ success: boolean; data: Result }, Partial<Result>>({
      query: (newResult) => ({
        url: '/results',
        method: 'POST',
        body: newResult,
      }),
      invalidatesTags: ["Results"],
    }),
    updateResult: build.mutation<{ success: boolean; data: Result }, { id: number; data: Partial<Result> }>({
      query: ({ id, data }) => ({
        url: `/results/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Results"],
    }),
    deleteResult: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/results/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Results"],
    }),
    getAttendances: build.query<{ success: boolean; data: Attendance[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/attendances',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Attendances"],
    }),
    createAttendance: build.mutation<{ success: boolean; data: Attendance }, Partial<Attendance>>({
      query: (newAttendance) => ({
        url: '/attendances',
        method: 'POST',
        body: newAttendance,
      }),
      invalidatesTags: ["Attendances"],
    }),
    updateAttendance: build.mutation<{ success: boolean; data: Attendance }, { id: number; data: Partial<Attendance> }>({
      query: ({ id, data }) => ({
        url: `/attendances/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Attendances"],
    }),
    deleteAttendance: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/attendances/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Attendances"],
    }),
    getAssignments: build.query<{ success: boolean; data: Assignment[] }, { schoolId: number; search?: string }>({
      query: ({ schoolId, search }) => ({
        url: '/assignments',
        params: {
          schoolId,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Assignments"],
    }),
    createAssignment: build.mutation<{ success: boolean; data: Assignment }, Partial<Assignment>>({
      query: (newAssignment) => ({
        url: '/assignments',
        method: 'POST',
        body: newAssignment,
      }),
      invalidatesTags: ["Assignments"],
    }),
    updateAssignment: build.mutation<{ success: boolean; data: Assignment }, { id: number; data: Partial<Assignment> }>({
      query: ({ id, data }) => ({
        url: `/assignments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Assignments"],
    }),
    deleteAssignment: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Assignments"],
    }),
    // Fees
    getFees: build.query<{ success: boolean; data: Fee[] }, { schoolId: number }>({
      query: ({ schoolId }) => ({
        url: '/fees',
        params: { schoolId },
      }),
      providesTags: ["Fees"],
    }),
    createFee: build.mutation<{ success: boolean; data: Fee }, Partial<Fee>>({
      query: (newFee) => ({
        url: '/fees',
        method: 'POST',
        body: newFee,
      }),
      invalidatesTags: ["Fees"],
    }),
    updateFee: build.mutation<{ success: boolean; data: Fee }, { id: number; data: Partial<Fee> }>({
      query: ({ id, data }) => ({
        url: `/fees/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Fees"],
    }),
    deleteFee: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/fees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Fees"],
    }),
    // Student Fees
    getStudentFees: build.query<{ success: boolean; data: StudentFee[] }, { schoolId: number; studentId?: number }>({
      query: ({ schoolId, studentId }) => ({
        url: '/student-fees',
        params: { schoolId, ...(studentId && { studentId }) },
      }),
      providesTags: ["StudentFees"],
    }),
    createStudentFee: build.mutation<{ success: boolean; data: StudentFee }, Partial<StudentFee>>({
      query: (newStudentFee) => ({
        url: '/student-fees',
        method: 'POST',
        body: newStudentFee,
      }),
      invalidatesTags: ["StudentFees"],
    }),
    assignFeesByGrade: build.mutation<{ success: boolean; message: string; data: any }, { gradeId: number; schoolId: number; dueDate: string; academicYear?: string; term?: string }>({
      query: (data) => ({
        url: '/student-fees/assign-by-grade',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ["StudentFees"],
    }),
    updateStudentFee: build.mutation<{ success: boolean; data: StudentFee }, { id: number; data: Partial<StudentFee> }>({
      query: ({ id, data }) => ({
        url: `/student-fees/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["StudentFees"],
    }),
    deleteStudentFee: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/student-fees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["StudentFees"],
    }),
    // Payments
    getPayments: build.query<{ success: boolean; data: Payment[] }, { schoolId: number; studentId?: number }>({
      query: ({ schoolId, studentId }) => ({
        url: '/payments',
        params: { schoolId, ...(studentId && { studentId }) },
      }),
      providesTags: ["Payments"],
    }),
    createPayment: build.mutation<{ success: boolean; data: Payment }, Partial<Payment> & { feeAllocations?: Array<{ studentFeeId: number; amount: number }> }>({
      query: (newPayment) => ({
        url: '/payments',
        method: 'POST',
        body: newPayment,
      }),
      invalidatesTags: ["Payments", "StudentFees"],
    }),
    updatePayment: build.mutation<{ success: boolean; data: Payment }, { id: number; data: Partial<Payment> }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Payments"],
    }),
    deletePayment: build.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Payments", "StudentFees"],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetTeachersQuery,
  useGetTeacherByIdQuery,
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
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useGetResultsQuery,
  useCreateResultMutation,
  useUpdateResultMutation,
  useDeleteResultMutation,
  useGetAttendancesQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetFeesQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
  useGetStudentFeesQuery,
  useCreateStudentFeeMutation,
  useAssignFeesByGradeMutation,
  useUpdateStudentFeeMutation,
  useDeleteStudentFeeMutation,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} = api;