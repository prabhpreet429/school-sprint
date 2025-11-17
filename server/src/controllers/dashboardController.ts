import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

/**
 * Get dashboard data including:
 * - Upcoming events
 * - Students count
 * - Teachers count
 * - School details
 * - Attendance data
 */
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params only (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    // Validate that schoolId is provided
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /dashboard?schoolId=1"
      });
    }
    
    // Parse and validate schoolId
    const schoolId = parseInt(querySchoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number."
      });
    }

    // Get current date for filtering upcoming events
    const now = new Date();

    // Fetch all data in parallel for better performance
    const [
      upcomingEvents,
      studentsCount,
      teachersCount,
      schoolDetails,
      attendanceData
    ] = await Promise.all([
      // Get upcoming events (events with startTime >= now)
      prisma.event.findMany({
        where: {
          schoolId,
          startTime: {
            gte: now
          }
        },
        orderBy: {
          startTime: 'asc'
        },
        take: 10, // Limit to 10 upcoming events
        include: {
          class: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),

      // Get students count
      prisma.student.count({
        where: {
          schoolId
        }
      }),

      // Get teachers count
      prisma.teacher.count({
        where: {
          schoolId
        }
      }),

      // Get school details
      prisma.school.findUnique({
        where: {
          id: schoolId
        },
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      }),

      // Get attendance data (recent attendance records with statistics)
      prisma.attendance.findMany({
        where: {
          schoolId,
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1) // Current month
          }
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              surname: true
            }
          },
          lesson: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        take: 50 // Limit to 50 recent attendance records
      })
    ]);

    // Calculate attendance statistics
    const totalAttendanceRecords = attendanceData.length;
    const presentCount = attendanceData.filter(att => att.present).length;
    const absentCount = totalAttendanceRecords - presentCount;
    const attendanceRate = totalAttendanceRecords > 0 
      ? (presentCount / totalAttendanceRecords) * 100 
      : 0;

    // Format the response
    const dashboardData = {
      schoolDetails: schoolDetails || null,
      counts: {
        students: studentsCount,
        teachers: teachersCount
      },
      upcomingEvents: upcomingEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        className: event.class?.name || null
      })),
      attendance: {
        recentRecords: attendanceData.map(att => ({
          id: att.id,
          date: att.date,
          present: att.present,
          student: {
            id: att.student.id,
            name: `${att.student.name} ${att.student.surname}`
          },
          lesson: {
            id: att.lesson.id,
            name: att.lesson.name
          }
        })),
        statistics: {
          totalRecords: totalAttendanceRecords,
          present: presentCount,
          absent: absentCount,
          attendanceRate: Math.round(attendanceRate * 100) / 100 // Round to 2 decimal places
        }
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};


