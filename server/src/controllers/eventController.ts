import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { parseDateTime, isValidDate } from "../utils/dateTime.js";

const prisma = new PrismaClient();

export const getEvents = async (req: Request, res: Response) => {
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

    const events = await prisma.event.findMany({
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
        startTime: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      schoolId,
      classId,
    } = req.body;

    // Validation
    const requiredFields = ["title", "description", "startTime", "endTime", "schoolId"];
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

    // Parse datetime strings - frontend sends ISO strings (UTC)
    let start: Date;
    let end: Date;
    
    try {
      start = parseDateTime(startTime);
      end = parseDateTime(endTime);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid date format",
      });
    }

    if (!isValidDate(start) || !isValidDate(end)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
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

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        startTime: start,
        endTime: end,
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
      data: event,
    });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startTime,
      endTime,
      classId,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Validation
    const requiredFields = ["title", "description", "startTime", "endTime"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Parse datetime strings - frontend sends ISO strings (UTC)
    let start: Date;
    let end: Date;
    
    try {
      start = parseDateTime(startTime);
      end = parseDateTime(endTime);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid date format",
      });
    }

    if (!isValidDate(start) || !isValidDate(end)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
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
          schoolId: existingEvent.schoolId,
        },
      });

      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: "Class not found or does not belong to this school",
        });
      }
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: title.trim(),
        description: description.trim(),
        startTime: start,
        endTime: end,
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
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};

