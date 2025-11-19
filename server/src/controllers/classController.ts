import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getClasses = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /classes?schoolId=1"
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
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ];
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        _count: {
          select: {
            students: true,
            lessons: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve classes.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const {
      name,
      capacity,
      schoolId,
      gradeId,
      supervisorId,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      name,
      capacity,
      schoolId,
      gradeId,
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
    if (isNaN(Number(capacity)) || Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: "capacity must be a valid positive number",
      });
    }

    if (isNaN(Number(schoolId))) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number",
      });
    }

    if (isNaN(Number(gradeId))) {
      return res.status(400).json({
        success: false,
        message: "gradeId must be a valid number",
      });
    }

    if (supervisorId !== undefined && supervisorId !== null && isNaN(Number(supervisorId))) {
      return res.status(400).json({
        success: false,
        message: "supervisorId must be a valid number",
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

    // Check if grade exists and belongs to the school
    const grade = await prisma.grade.findUnique({
      where: { id: Number(gradeId) },
    });
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }
    if (grade.schoolId !== Number(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Grade does not belong to the specified school",
      });
    }

    // Check if supervisor exists and belongs to the school (if provided)
    if (supervisorId) {
      const supervisor = await prisma.teacher.findUnique({
        where: { id: Number(supervisorId) },
      });
      if (!supervisor) {
        return res.status(404).json({
          success: false,
          message: "Supervisor (teacher) not found",
        });
      }
      if (supervisor.schoolId !== Number(schoolId)) {
        return res.status(400).json({
          success: false,
          message: "Supervisor does not belong to the specified school",
        });
      }
    }

    // Check if class name already exists for this school
    const existingClass = await prisma.class.findFirst({
      where: {
        name: String(name),
        schoolId: Number(schoolId),
      },
    });
    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: `Class name "${name}" already exists for this school`,
      });
    }

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name: String(name),
        capacity: Number(capacity),
        schoolId: Number(schoolId),
        gradeId: Number(gradeId),
        supervisorId: supervisorId ? Number(supervisorId) : null,
      },
      include: {
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        _count: {
          select: {
            students: true,
            lessons: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create class",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

