import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getSchoolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const schoolId = parseInt(id, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school ID",
      });
    }

    const school = await prisma.school.findUnique({
      where: {
        id: schoolId,
      },
      select: {
        id: true,
        name: true,
        addressLine1: true,
        state: true,
        pinCode: true,
        phone: true,
        email: true,
        country: true,
        timezone: true,
        logo: true,
      },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.status(200).json({ success: true, data: school });
  } catch (error) {
    console.error("Error fetching school:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve school.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSchools = async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        addressLine1: true,
        state: true,
        pinCode: true,
        phone: true,
        email: true,
        country: true,
        timezone: true,
        logo: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({ success: true, data: schools });
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve schools.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update school (Admin only)
export const updateSchool = async (req: Request, res: Response) => {
  try {
    const requester = (req as any).user;
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update school information",
      });
    }

    const { id } = req.params;
    const { phone, addressLine1, state, pinCode, country, timezone, logo } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    const schoolId = parseInt(id, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school ID",
      });
    }

    // Verify the school belongs to the admin's school
    if (schoolId !== requester.schoolId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own school",
      });
    }

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!existingSchool) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    if (phone !== undefined) updateData.phone = phone || null;
    if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1 || null;
    if (state !== undefined) updateData.state = state || null;
    if (pinCode !== undefined) updateData.pinCode = pinCode || null;
    if (country !== undefined) updateData.country = country;
    if (timezone !== undefined) updateData.timezone = timezone || "UTC";
    if (logo !== undefined) updateData.logo = logo || null;

    // Update school
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: updateData,
      select: {
        id: true,
        name: true,
        addressLine1: true,
        state: true,
        pinCode: true,
        phone: true,
        email: true,
        country: true,
        timezone: true,
        logo: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "School updated successfully",
      data: updatedSchool,
    });
  } catch (error) {
    console.error("Error updating school:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update school",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

