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
        address: true,
        phone: true,
        email: true,
        country: true,
        timezone: true,
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
        address: true,
        phone: true,
        email: true,
        country: true,
        timezone: true,
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

