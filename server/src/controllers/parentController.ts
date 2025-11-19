import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getParents = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /parents?schoolId=1"
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
        {
          surname: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          username: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ];
    }

    const parents = await prisma.parent.findMany({
      where: whereClause,
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ success: true, data: parents });
  } catch (error) {
    console.error("Error fetching parents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve parents.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createParent = async (req: Request, res: Response) => {
  try {
    const {
      username,
      name,
      surname,
      address,
      schoolId,
      email,
      phone,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      username,
      name,
      surname,
      address,
      schoolId,
      phone,
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

    // Check if username is already taken for this school
    const existingUsername = await prisma.parent.findFirst({
      where: {
        username,
        schoolId: Number(schoolId),
      },
    });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already exists for this school",
      });
    }

    // Check if email is already taken for this school (if provided)
    if (email) {
      const existingEmail = await prisma.parent.findFirst({
        where: {
          email,
          schoolId: Number(schoolId),
        },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists for this school",
        });
      }
    }

    // Check if phone is already taken for this school
    const existingPhone = await prisma.parent.findFirst({
      where: {
        phone,
        schoolId: Number(schoolId),
      },
    });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone already exists for this school",
      });
    }

    // Create the parent
    const parent = await prisma.parent.create({
      data: {
        username,
        name,
        surname,
        address,
        schoolId: Number(schoolId),
        email: email || null,
        phone,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Parent created successfully",
      data: parent,
    });
  } catch (error) {
    console.error("Error creating parent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create parent.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

