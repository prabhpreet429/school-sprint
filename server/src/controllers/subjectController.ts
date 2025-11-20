import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getSubjects = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /subjects?schoolId=1"
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
      whereClause.name = {
        contains: search,
        mode: "insensitive" as const,
      };
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        _count: {
          select: {
            teachers: true,
            lessons: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve subjects.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, schoolId } = req.body;

    if (!name || !schoolId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, schoolId",
      });
    }

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

    // Check if subject name already exists for this school
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: String(name),
        schoolId: Number(schoolId),
      },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject with this name already exists for this school",
      });
    }

    const subject = await prisma.subject.create({
      data: {
        name: String(name),
        schoolId: Number(schoolId),
      },
      include: {
        _count: {
          select: {
            teachers: true,
            lessons: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subject",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Subject ID is required",
      });
    }

    const subjectId = parseInt(id, 10);
    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Check if another subject with the same name exists for this school
    const duplicateSubject = await prisma.subject.findFirst({
      where: {
        name: String(name),
        schoolId: existingSubject.schoolId,
        id: { not: subjectId },
      },
    });

    if (duplicateSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject with this name already exists for this school",
      });
    }

    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: String(name),
      },
      include: {
        _count: {
          select: {
            teachers: true,
            lessons: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: updatedSubject,
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subject",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Subject ID is required",
      });
    }

    const subjectId = parseInt(id, 10);
    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Delete the subject (cascade will handle related records)
    await prisma.subject.delete({
      where: { id: subjectId },
    });

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete subject",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

