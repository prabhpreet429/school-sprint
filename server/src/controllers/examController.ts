import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getExams = async (req: Request, res: Response) => {
  try {
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /exams?schoolId=1"
      });
    }

    const schoolId = parseInt(querySchoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number."
      });
    }

    const search = req.query.search ? String(req.query.search) : "";
    
    // Get optional classId parameter
    const queryClassId = req.query.classId ? String(req.query.classId) : null;
    const classId = queryClassId ? parseInt(queryClassId, 10) : null;

    const whereClause: any = {
      schoolId: schoolId,
    };

    // Add classId filter if provided (through lesson)
    if (classId && !isNaN(classId)) {
      whereClause.lesson = {
        classId: classId,
      };
    }

    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive" as const,
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

    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
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
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: [
        { startTime: "asc" },
      ],
    });

    res.status(200).json({ success: true, data: exams });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve exams.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      startTime,
      endTime,
      schoolId,
      lessonId,
    } = req.body;

    const requiredFields = {
      title,
      startTime,
      endTime,
      schoolId,
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

    if (isNaN(Number(schoolId))) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number",
      });
    }

    if (isNaN(Number(lessonId))) {
      return res.status(400).json({
        success: false,
        message: "lessonId must be a valid number",
      });
    }

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

    const school = await prisma.school.findUnique({
      where: { id: Number(schoolId) },
    });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
    });
    if (!lesson || lesson.schoolId !== Number(schoolId)) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found or does not belong to this school",
      });
    }

    // Check if user is teacher and verify they own the lesson
    const user = (req as any).user;
    if (user && user.role === "teacher") {
      const admin = await prisma.admin.findUnique({
        where: { id: user.id },
        include: { teacher: true },
      });

      if (!admin || !admin.teacherId) {
        return res.status(403).json({
          success: false,
          message: "Teacher account not found",
        });
      }

      if (lesson.teacherId !== admin.teacherId) {
        return res.status(403).json({
          success: false,
          message: "You can only create exams for your own lessons",
        });
      }
    }

    const exam = await prisma.exam.create({
      data: {
        title: String(title),
        startTime: start,
        endTime: end,
        schoolId: Number(schoolId),
        lessonId: Number(lessonId),
      },
      include: {
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
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data: exam,
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create exam",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      startTime,
      endTime,
      lessonId,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required",
      });
    }

    const examId = parseInt(id, 10);
    if (isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const existingExam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const requiredFields = {
      title,
      startTime,
      endTime,
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

    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
    });
    if (!lesson || lesson.schoolId !== existingExam.schoolId) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found or does not belong to this school",
      });
    }

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: String(title),
        startTime: start,
        endTime: end,
        lessonId: Number(lessonId),
      },
      include: {
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
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      data: updatedExam,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update exam",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required",
      });
    }

    const examId = parseInt(id, 10);
    if (isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    await prisma.exam.delete({
      where: { id: examId },
    });

    res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete exam",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

