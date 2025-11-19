import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { schoolId, search } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    const schoolIdNum = parseInt(schoolId as string);
    if (isNaN(schoolIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schoolId",
      });
    }

    const where: any = {
      schoolId: schoolIdNum,
    };

    if (search && typeof search === "string" && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      date,
      schoolId,
      classId,
    } = req.body;

    // Validation
    const requiredFields = ["title", "description", "date", "schoolId"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate schoolId
    const schoolIdNum = parseInt(schoolId);
    if (isNaN(schoolIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schoolId",
      });
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolIdNum },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Parse date string as local date to avoid timezone issues
    // If format is YYYY-MM-DD, parse it as local midnight
    const announcementDate = date.match(/^\d{4}-\d{2}-\d{2}$/) 
      ? (() => {
          const [year, month, day] = date.split('-').map(Number);
          return new Date(year, month - 1, day);
        })()
      : new Date(date);
    if (isNaN(announcementDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Validate classId if provided
    if (classId !== undefined && classId !== null) {
      const classIdNum = parseInt(classId);
      if (isNaN(classIdNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid classId",
        });
      }

      const classExists = await prisma.class.findFirst({
        where: {
          id: classIdNum,
          schoolId: schoolIdNum,
        },
      });

      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: "Class not found or does not belong to this school",
        });
      }
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        date: announcementDate,
        schoolId: schoolIdNum,
        classId: classId ? parseInt(classId) : null,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating announcement",
      error: error.message,
    });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      classId,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Announcement ID is required",
      });
    }

    const announcementId = parseInt(id, 10);
    if (isNaN(announcementId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Validation
    const requiredFields = ["title", "description", "date"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Parse date string as local date to avoid timezone issues
    // If format is YYYY-MM-DD, parse it as local midnight
    const announcementDate = date.match(/^\d{4}-\d{2}-\d{2}$/) 
      ? (() => {
          const [year, month, day] = date.split('-').map(Number);
          return new Date(year, month - 1, day);
        })()
      : new Date(date);
    if (isNaN(announcementDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Validate classId if provided
    if (classId !== undefined && classId !== null) {
      const classIdNum = parseInt(classId);
      if (isNaN(classIdNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid classId",
        });
      }

      const classExists = await prisma.class.findFirst({
        where: {
          id: classIdNum,
          schoolId: existingAnnouncement.schoolId,
        },
      });

      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: "Class not found or does not belong to this school",
        });
      }
    }

    // Update the announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: title.trim(),
        description: description.trim(),
        date: announcementDate,
        classId: classId ? parseInt(classId) : null,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedAnnouncement,
    });
  } catch (error: any) {
    console.error("Error updating announcement:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating announcement",
      error: error.message,
    });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Announcement ID is required",
      });
    }

    const announcementId = parseInt(id, 10);
    if (isNaN(announcementId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    // Check if announcement exists
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Delete the announcement
    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting announcement:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting announcement",
      error: error.message,
    });
  }
};

