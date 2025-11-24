import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAssignments = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /assignments?schoolId=1"
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

    // Add classId filter if provided (through lesson)
    if (classId && !isNaN(classId)) {
      whereClause.lesson = {
        classId: classId,
      };
    }

    // Add search filter if provided
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
        {
          lesson: {
            subject: {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
        },
      ];
    }

    const assignments = await prisma.assignment.findMany({
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
            teacher: {
              select: {
                id: true,
                name: true,
                surname: true,
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
      orderBy: {
        startDate: "desc",
      },
    });

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve assignments.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const {
      title,
      startDate,
      dueDate,
      schoolId,
      lessonId,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      title,
      startDate,
      dueDate,
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

    // Validate numeric fields
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

    // Validate dates
    const start = new Date(startDate);
    const due = new Date(dueDate);

    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate format",
      });
    }

    if (isNaN(due.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid dueDate format",
      });
    }

    if (due < start) {
      return res.status(400).json({
        success: false,
        message: "dueDate must be after startDate",
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

      const lesson = await prisma.lesson.findUnique({
        where: { id: Number(lessonId) },
      });

      if (!lesson || lesson.teacherId !== admin.teacherId) {
        return res.status(403).json({
          success: false,
          message: "You can only create assignments for your own lessons",
        });
      }
    }

    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: String(title),
        startDate: start,
        dueDate: due,
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
            teacher: {
              select: {
                id: true,
                name: true,
                surname: true,
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
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      startDate,
      dueDate,
      lessonId,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required",
      });
    }

    const assignmentId = parseInt(id, 10);
    if (isNaN(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Validate required fields
    const requiredFields = {
      title,
      startDate,
      dueDate,
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

    // Validate dates
    const start = new Date(startDate);
    const due = new Date(dueDate);

    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate format",
      });
    }

    if (isNaN(due.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid dueDate format",
      });
    }

    if (due < start) {
      return res.status(400).json({
        success: false,
        message: "dueDate must be after startDate",
      });
    }

    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title: String(title),
        startDate: start,
        dueDate: due,
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
            teacher: {
              select: {
                id: true,
                name: true,
                surname: true,
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
      message: "Assignment updated successfully",
      data: updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update assignment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required",
      });
    }

    const assignmentId = parseInt(id, 10);
    if (isNaN(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Delete the assignment
    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

