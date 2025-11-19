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

export const updateParent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      username,
      name,
      surname,
      address,
      email,
      phone,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Parent ID is required",
      });
    }

    const parentId = parseInt(id, 10);
    if (isNaN(parentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent ID",
      });
    }

    // Check if parent exists
    const existingParent = await prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!existingParent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    // Validate required fields
    const requiredFields = {
      username,
      name,
      surname,
      address,
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

    // Check if username is already taken by another parent in the same school
    if (username !== existingParent.username) {
      const existingUsername = await prisma.parent.findFirst({
        where: {
          username,
          schoolId: existingParent.schoolId,
          id: { not: parentId },
        },
      });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username already exists for this school",
        });
      }
    }

    // Check if email is already taken by another parent in the same school (if provided)
    if (email && email !== existingParent.email) {
      const existingEmail = await prisma.parent.findFirst({
        where: {
          email,
          schoolId: existingParent.schoolId,
          id: { not: parentId },
        },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists for this school",
        });
      }
    }

    // Check if phone is already taken by another parent in the same school
    if (phone !== existingParent.phone) {
      const existingPhone = await prisma.parent.findFirst({
        where: {
          phone,
          schoolId: existingParent.schoolId,
          id: { not: parentId },
        },
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone already exists for this school",
        });
      }
    }

    // Update the parent
    const updatedParent = await prisma.parent.update({
      where: { id: parentId },
      data: {
        username,
        name,
        surname,
        address,
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

    res.status(200).json({
      success: true,
      message: "Parent updated successfully",
      data: updatedParent,
    });
  } catch (error) {
    console.error("Error updating parent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update parent",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteParent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Parent ID is required",
      });
    }

    const parentId = parseInt(id, 10);
    if (isNaN(parentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent ID",
      });
    }

    // Check if parent exists
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    // Delete the parent (cascade will handle related records)
    await prisma.parent.delete({
      where: { id: parentId },
    });

    res.status(200).json({
      success: true,
      message: "Parent deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting parent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete parent",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

