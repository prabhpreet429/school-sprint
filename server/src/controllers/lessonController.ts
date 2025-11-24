import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getLessons = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /lessons?schoolId=1"
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
    
    // Get optional classId parameter
    const queryClassId = req.query.classId ? String(req.query.classId) : null;
    const classId = queryClassId ? parseInt(queryClassId, 10) : null;

    // Build where clause
    const whereClause: any = {
      schoolId: schoolId,
    };

    // Add classId filter if provided
    if (classId && !isNaN(classId)) {
      whereClause.classId = classId;
    }

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          subject: {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
      ];
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      include: {
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
            grade: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        _count: {
          select: {
            attendances: true,
            exams: true,
            assignments: true,
          },
        },
      },
      orderBy: [
        { day: "asc" },
        { startTime: "asc" },
      ],
    });

    res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lessons.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const {
      name,
      day,
      startTime,
      endTime,
      schoolId,
      subjectId,
      classId,
      teacherId,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      name,
      day,
      startTime,
      endTime,
      schoolId,
      subjectId,
      classId,
      teacherId,
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

    // Validate day enum
    const validDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: "day must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY",
      });
    }

    // Validate numeric fields
    if (isNaN(Number(schoolId))) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number",
      });
    }

    if (isNaN(Number(subjectId))) {
      return res.status(400).json({
        success: false,
        message: "subjectId must be a valid number",
      });
    }

    if (isNaN(Number(classId))) {
      return res.status(400).json({
        success: false,
        message: "classId must be a valid number",
      });
    }

    if (isNaN(Number(teacherId))) {
      return res.status(400).json({
        success: false,
        message: "teacherId must be a valid number",
      });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "startTime and endTime must be valid dates",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "endTime must be after startTime",
      });
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id: Number(schoolId) },
    });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Check if subject exists and belongs to the school
    const subject = await prisma.subject.findUnique({
      where: { id: Number(subjectId) },
    });
    if (!subject || subject.schoolId !== Number(schoolId)) {
      return res.status(404).json({
        success: false,
        message: "Subject not found or does not belong to this school",
      });
    }

    // Check if class exists and belongs to the school
    const classExists = await prisma.class.findUnique({
      where: { id: Number(classId) },
    });
    if (!classExists || classExists.schoolId !== Number(schoolId)) {
      return res.status(404).json({
        success: false,
        message: "Class not found or does not belong to this school",
      });
    }

    // Check if teacher exists and belongs to the school
    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(teacherId) },
    });
    if (!teacher || teacher.schoolId !== Number(schoolId)) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found or does not belong to this school",
      });
    }

    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: {
        name: String(name),
        day: day as any,
        startTime: start,
        endTime: end,
        schoolId: Number(schoolId),
        subjectId: Number(subjectId),
        classId: Number(classId),
        teacherId: Number(teacherId),
      },
      include: {
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
            grade: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        _count: {
          select: {
            attendances: true,
            exams: true,
            assignments: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      day,
      startTime,
      endTime,
      subjectId,
      classId,
      teacherId,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required",
      });
    }

    const lessonId = parseInt(id, 10);
    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Validate required fields
    const requiredFields = {
      name,
      day,
      startTime,
      endTime,
      subjectId,
      classId,
      teacherId,
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

    // Validate day enum
    const validDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: "day must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY",
      });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "startTime and endTime must be valid dates",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "endTime must be after startTime",
      });
    }

    // Validate subject exists and belongs to the school
    const subject = await prisma.subject.findUnique({
      where: { id: Number(subjectId) },
    });
    if (!subject || subject.schoolId !== existingLesson.schoolId) {
      return res.status(404).json({
        success: false,
        message: "Subject not found or does not belong to this school",
      });
    }

    // Validate class exists and belongs to the school
    const classExists = await prisma.class.findUnique({
      where: { id: Number(classId) },
    });
    if (!classExists || classExists.schoolId !== existingLesson.schoolId) {
      return res.status(404).json({
        success: false,
        message: "Class not found or does not belong to this school",
      });
    }

    // Validate teacher exists and belongs to the school
    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(teacherId) },
    });
    if (!teacher || teacher.schoolId !== existingLesson.schoolId) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found or does not belong to this school",
      });
    }

    // Update the lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        name: String(name),
        day: day as any,
        startTime: start,
        endTime: end,
        subjectId: Number(subjectId),
        classId: Number(classId),
        teacherId: Number(teacherId),
      },
      include: {
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
            grade: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        _count: {
          select: {
            attendances: true,
            exams: true,
            assignments: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: updatedLesson,
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required",
      });
    }

    const lessonId = parseInt(id, 10);
    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      });
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Delete the lesson (cascade will handle related records)
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

