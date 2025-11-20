import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAttendances = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /attendances?schoolId=1"
      });
    }

    const schoolId = parseInt(querySchoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number."
      });
    }

    // Get optional search parameter
    const search = req.query.search ? String(req.query.search) : "";

    // Build where clause
    const whereClause: any = {
      schoolId: schoolId,
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        {
          student: {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
        {
          student: {
            surname: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
        {
          lesson: {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
      ];
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        lesson: {
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    res.status(200).json({ success: true, data: attendances });
  } catch (error) {
    console.error("Error fetching attendances:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve attendances.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const {
      date,
      present,
      schoolId,
      studentId,
      lessonId,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      date,
      present,
      schoolId,
      studentId,
      lessonId,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate numeric fields
    if (isNaN(Number(schoolId))) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number",
      });
    }

    if (isNaN(Number(studentId))) {
      return res.status(400).json({
        success: false,
        message: "studentId must be a valid number",
      });
    }

    if (isNaN(Number(lessonId))) {
      return res.status(400).json({
        success: false,
        message: "lessonId must be a valid number",
      });
    }

    // Validate date
    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Validate boolean
    if (typeof present !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "present must be a boolean value",
      });
    }

    // Create the attendance
    const attendance = await prisma.attendance.create({
      data: {
        date: attendanceDate,
        present: Boolean(present),
        schoolId: Number(schoolId),
        studentId: Number(studentId),
        lessonId: Number(lessonId),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        lesson: {
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create attendance",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      date,
      present,
      studentId,
      lessonId,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Attendance ID is required",
      });
    }

    const attendanceId = parseInt(id, 10);
    if (isNaN(attendanceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID",
      });
    }

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!existingAttendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Validate required fields
    const requiredFields = {
      date,
      present,
      studentId,
      lessonId,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate date
    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Validate boolean
    if (typeof present !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "present must be a boolean value",
      });
    }

    // Update the attendance
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        date: attendanceDate,
        present: Boolean(present),
        studentId: Number(studentId),
        lessonId: Number(lessonId),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        lesson: {
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Attendance ID is required",
      });
    }

    const attendanceId = parseInt(id, 10);
    if (isNaN(attendanceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID",
      });
    }

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!existingAttendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Delete the attendance
    await prisma.attendance.delete({
      where: { id: attendanceId },
    });

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete attendance",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

