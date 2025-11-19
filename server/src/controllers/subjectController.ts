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

