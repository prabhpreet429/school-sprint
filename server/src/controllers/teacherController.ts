import { PrismaClient, UserSex } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getTeachers = async (req: Request, res: Response) => {
  try {
    // Get schoolId from query params (required)
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;
    
    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /teachers?schoolId=1"
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

    const teachers = await prisma.teacher.findMany({
      where: whereClause,
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        subjects: {
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

    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve teachers.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const querySchoolId = (req.query && req.query.schoolId) ? String(req.query.schoolId) : null;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const teacherId = parseInt(id, 10);
    if (isNaN(teacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    if (!querySchoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required as a query parameter. Example: /teachers/1?schoolId=1"
      });
    }

    const schoolId = parseInt(querySchoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number.",
      });
    }

    const teacher = await prisma.teacher.findFirst({
      where: {
        id: teacherId,
        schoolId: schoolId,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
          },
        },
        classes: {
          select: {
            id: true,
            name: true,
            grade: {
              select: {
                id: true,
                level: true,
              },
            },
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        lessons: {
          select: {
            id: true,
            name: true,
            day: true,
            startTime: true,
            endTime: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            lessons: true,
            classes: true,
            subjects: true,
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve teacher.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const {
      username,
      name,
      surname,
      address,
      bloodType,
      sex,
      schoolId,
      birthday,
      email,
      phone,
      img,
      subjectIds,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      username,
      name,
      surname,
      address,
      bloodType,
      sex,
      schoolId,
      birthday,
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

    // Validate sex enum
    if (sex !== UserSex.MALE && sex !== UserSex.FEMALE) {
      return res.status(400).json({
        success: false,
        message: "sex must be either 'MALE' or 'FEMALE'",
      });
    }

    // Validate schoolId is a number
    if (isNaN(Number(schoolId))) {
      return res.status(400).json({
        success: false,
        message: "schoolId must be a valid number",
      });
    }

    // Validate birthday is a valid date
    // Parse date string as local date to avoid timezone issues
    // If format is YYYY-MM-DD, parse it as local midnight
    const birthdayDate = birthday.match(/^\d{4}-\d{2}-\d{2}$/) 
      ? (() => {
          const [year, month, day] = birthday.split('-').map(Number);
          return new Date(year, month - 1, day);
        })()
      : new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "birthday must be a valid date",
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
    const existingUsername = await prisma.teacher.findFirst({
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
      const existingEmail = await prisma.teacher.findFirst({
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

    // Check if phone is already taken for this school (if provided)
    if (phone) {
      const existingPhone = await prisma.teacher.findFirst({
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
    }

    // Validate subjectIds if provided
    if (subjectIds && Array.isArray(subjectIds) && subjectIds.length > 0) {
      const subjectIdsNumbers = subjectIds.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
      if (subjectIdsNumbers.length > 0) {
        // Verify all subjects exist and belong to the school
        const subjects = await prisma.subject.findMany({
          where: {
            id: { in: subjectIdsNumbers },
            schoolId: Number(schoolId),
          },
        });
        if (subjects.length !== subjectIdsNumbers.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subjects not found or do not belong to this school",
          });
        }
      }
    }

    // Create the teacher
    const teacher = await prisma.teacher.create({
      data: {
        username,
        name,
        surname,
        address,
        bloodType,
        sex: sex as UserSex,
        schoolId: Number(schoolId),
        birthday: birthdayDate,
        email: email || null,
        phone: phone || null,
        img: img || null,
        subjects: subjectIds && Array.isArray(subjectIds) && subjectIds.length > 0
          ? {
              connect: subjectIds.map((id: any) => ({ id: Number(id) })),
            }
          : undefined,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create teacher.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      username,
      name,
      surname,
      address,
      bloodType,
      sex,
      birthday,
      email,
      phone,
      img,
      subjectIds,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const teacherId = parseInt(id, 10);
    if (isNaN(teacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!existingTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Validate required fields
    const requiredFields = {
      username,
      name,
      surname,
      address,
      bloodType,
      sex,
      birthday,
      schoolId: existingTeacher.schoolId,
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

    // Validate sex enum
    if (sex !== UserSex.MALE && sex !== UserSex.FEMALE) {
      return res.status(400).json({
        success: false,
        message: "sex must be either 'MALE' or 'FEMALE'",
      });
    }

    // Check if username is already taken by another teacher in the same school
    if (username !== existingTeacher.username) {
      const existingUsername = await prisma.teacher.findFirst({
        where: {
          username,
          schoolId: existingTeacher.schoolId,
          id: { not: teacherId },
        },
      });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username already exists for this school",
        });
      }
    }

    // Check if email is already taken by another teacher in the same school (if provided)
    if (email && email !== existingTeacher.email) {
      const existingEmail = await prisma.teacher.findFirst({
        where: {
          email,
          schoolId: existingTeacher.schoolId,
          id: { not: teacherId },
        },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists for this school",
        });
      }
    }

    // Check if phone is already taken by another teacher in the same school (if provided)
    if (phone && phone !== existingTeacher.phone) {
      const existingPhone = await prisma.teacher.findFirst({
        where: {
          phone,
          schoolId: existingTeacher.schoolId,
          id: { not: teacherId },
        },
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone already exists for this school",
        });
      }
    }

    // Validate subjectIds if provided
    if (subjectIds && Array.isArray(subjectIds) && subjectIds.length > 0) {
      const subjectIdsNumbers = subjectIds.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
      if (subjectIdsNumbers.length > 0) {
        // Verify all subjects exist and belong to the school
        const subjects = await prisma.subject.findMany({
          where: {
            id: { in: subjectIdsNumbers },
            schoolId: existingTeacher.schoolId,
          },
        });
        if (subjects.length !== subjectIdsNumbers.length) {
          return res.status(400).json({
            success: false,
            message: "One or more subjects not found or do not belong to this school",
          });
        }
      }
    }

    // Parse birthday as local date to avoid timezone issues
    const birthdayDate = birthday.match(/^\d{4}-\d{2}-\d{2}$/) 
      ? (() => {
          const [year, month, day] = birthday.split('-').map(Number);
          return new Date(year, month - 1, day);
        })()
      : new Date(birthday);

    // Update the teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        username,
        name,
        surname,
        address,
        bloodType,
        sex: sex as UserSex,
        birthday: birthdayDate,
        email: email || null,
        phone: phone || null,
        img: img || null,
        subjects: subjectIds && Array.isArray(subjectIds)
          ? {
              set: subjectIds.length > 0
                ? subjectIds.map((id: any) => ({ id: Number(id) }))
                : [],
            }
          : undefined,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update teacher",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const teacherId = parseInt(id, 10);
    if (isNaN(teacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Delete the teacher (cascade will handle related records)
    await prisma.teacher.delete({
      where: { id: teacherId },
    });

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete teacher",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

