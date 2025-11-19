import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getGrades = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /grades?schoolId=1"
      });
    }

    const schoolId = parseInt(querySchoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number."
      });
    }

    const grades = await prisma.grade.findMany({
      where: {
        schoolId: schoolId,
      },
      include: {
        _count: {
          select: {
            students: true,
            classess: true,
          },
        },
      },
      orderBy: {
        level: "asc",
      },
    });

    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve grades.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createGrade = async (req: Request, res: Response) => {
  try {
    const {
      level,
      schoolId,
    } = req.body;

    // Validate required fields
    if (level === undefined || level === null) {
      return res.status(400).json({
        success: false,
        message: "level is required",
      });
    }

    if (schoolId === undefined || schoolId === null) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    // Validate level is a number
    if (isNaN(Number(level)) || Number(level) < 1) {
      return res.status(400).json({
        success: false,
        message: "level must be a valid positive number",
      });
    }

    // Validate schoolId is a number
    if (isNaN(Number(schoolId))) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number",
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

    // Check if grade level already exists for this school
    const existingGrade = await prisma.grade.findFirst({
      where: {
        level: Number(level),
        schoolId: Number(schoolId),
      },
    });
    if (existingGrade) {
      return res.status(409).json({
        success: false,
        message: `Grade level ${level} already exists for this school`,
      });
    }

    // Create the grade
    const grade = await prisma.grade.create({
      data: {
        level: Number(level),
        schoolId: Number(schoolId),
      },
      include: {
        _count: {
          select: {
            students: true,
            classess: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Grade created successfully",
      data: grade,
    });
  } catch (error) {
    console.error("Error creating grade:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create grade",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

